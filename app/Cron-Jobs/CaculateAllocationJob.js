const Queue = require("bull");
const _ = require("lodash");
const { BigNumber } = require("bignumber.js");
const Const = use("App/Common/Const");
const WhitelistService = use("App/Services/WhitelistUserService");
const StakingService = use("App/Services/StakingService");
const ProjectService = use("App/Services/ProjectService");
const StakingModel = use('App/Models/StakingPool');
const abi = require("../abi/Allocation.json");
const Web3 = require("web3");
const pLimit = require("../Common/ProcessLimit");
const limit = pLimit(Const.LIMIT_PROCESS_NUMBER);

const caculateAllocationQueue = new Queue(Const.ALLOCATION_CACULATION_QUEUE, {
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  settings: {
    lockDuration: 1000,
    maxStalledCount: 0,
  },
});

caculateAllocationQueue.process(async (job) => {
  try {
    console.log("Process Job id: ", job.id);

    const projectId = job.data;

    const whitelistService = new WhitelistService();

    const projectService = new ProjectService();

    const stakingServce = new StakingService();

    const project = await projectService.findByProjectId(projectId);

    if (!project) {
      console.log("no need to caculate");
      return;
    }

    const web3 = new Web3(process.env.URL_PROVIDER);

    const contract = new web3.eth.Contract(
      abi,
      project.$attributes.project_contract_address.toString()
    );

    if(project.$attributes.project_type == Const.PROJECT_TYPE.PRIVATE) {
        
        const whitelist = JSON.parse(JSON.stringify(await whitelistService.getWhiteListByProjectId(projectId)));

        let total = new BigNumber(0);
        let stakeWhiteListUsers = [];
  
        stakeWhiteListUsers = await Promise.all(
          whitelist.map(async (e) =>
            limit(async () => {
              const user = {
                projectId: projectId,
                stake_amount: await contract.methods.userAmounts(e.wallet_address).call(),
                wallet_address: e.wallet_address
              }
              return user;
            })
          )
        );
  
        stakeWhiteListUsers = stakeWhiteListUsers.filter((e) => e.stake_amount > 0);
  
        stakeWhiteListUsers.forEach((e) => {
          total = BigNumber.sum(total, e.stake_amount);
        });
  
        let upDateWhiteListUser = [];
  
        if (stakeWhiteListUsers.length <= project.$attributes.whitelist_trigger) {
          upDateWhiteListUser = stakeWhiteListUsers.map((element) => {
                                  const staking = new StakingModel;
                                  staking.project_id = element.projectId;
                                  staking.wallet_address = element.wallet_address;
                                  staking.allocation = project.$attributes.whitelist_untrigger;
                                  staking.stake_amount = element.stake_amount;
  
                                  return staking;
                                });
        }
        else {
          const percents = [0];
  
          for (let i = 0; i < stakeWhiteListUsers.length; i++) {
  
            const staking = new StakingModel;
            staking.project_id =  stakeWhiteListUsers[i].projectId;
            staking.wallet_address =  stakeWhiteListUsers[i].wallet_address;
            staking.stake_amount =  stakeWhiteListUsers[i].stake_amount;
            if (i === stakeWhiteListUsers.length - 1) {
              const latestPercent = 1 - _.sum(percents);
              staking.allocation = new BigNumber(latestPercent)
                .multipliedBy(project.$attributes.whitelist_hardcap)
                .toString();
            } else {
              const userAmount = new BigNumber(
                stakeWhiteListUsers[i].stake_amount
              );
              const stakePercent = userAmount.div(total).toFixed(10);
              staking.allocation = new BigNumber(stakePercent)
                .multipliedBy(project.$attributes.whitelist_hardcap)
                .toString();
              percents.push(+stakePercent);
              console.log('allocationnnnnn', projectId, staking.allocation);
            }
  
            upDateWhiteListUser.push(staking);
          }
        }
  
        await Promise.all(
          upDateWhiteListUser.map(async (e) => await e.save())
        );

    }

    else {

      const stakeUsers = await stakingServce.getStakeUsers(projectId);

      const whitelist = await whitelistService.getWhiteListByProjectId(projectId);

      const whitelistDatas = JSON.parse(JSON.stringify(whitelist));

      const setWhiteListDatas = new Set(
        whitelistDatas.map((e) => e.wallet_address)
      );

      let whiteListArr = [];
      let otherArr = [];

      for (const stakeUser of stakeUsers.rows) {
        if (setWhiteListDatas.has(stakeUser.$attributes.wallet_address)) {
          whiteListArr.push(stakeUser);
        } else {
          otherArr.push(stakeUser);
        }
      }

      const whiteListArrAddress = whiteListArr.map( e => e.$attributes.wallet_address);
      let otherWhiteList =  [];
      for(const user of whitelist.rows) {
        if(!whiteListArrAddress.includes(user.$attributes.wallet_address)) otherWhiteList.push(user);
      }

      if (whiteListArr.length > 0 || otherWhiteList.length > 0) {
        await handleWhiteListUsers(whiteListArr, project, contract, otherWhiteList);
      }

      if (otherArr.length > 0) {
        await handleOtherUsers(otherArr, project, contract);
      }
    }

    
  } catch (e) {
    console.log(e);
    job.moveToFailed(`${JSON.parse(e)}`, false);
  }
});

async function handleWhiteListUsers(whiteListUsers, project, contract, otherWhiteList) {
  let total = new BigNumber(0);

  await Promise.all(
    whiteListUsers.map(async (e) =>
      limit(async () => {
        e.$attributes.stake_amount = await contract.methods
          .userAmounts(e.$attributes.wallet_address)
          .call();
        return e;
      })
    )
  );

  let stakeWhiteListUsers = [];
  stakeWhiteListUsers = await Promise.all(
    otherWhiteList.map(async (e) =>
      limit(async () => {
        const user = {
          projectId: project.$attributes.id,
          stake_amount: await contract.methods.userAmounts(e.$attributes.wallet_address).call(),
          wallet_address: e.$attributes.wallet_address
        }
        return user;
      })
    )
  );

  whiteListUsers = whiteListUsers.filter((e) => e.$attributes.stake_amount > 0);
  stakeWhiteListUsers = stakeWhiteListUsers.filter((e) => e.stake_amount > 0);

  if (whiteListUsers.length === 0 && stakeWhiteListUsers.length === 0) return;

  whiteListUsers.forEach((e) => {
    total = BigNumber.sum(total, e.$attributes.stake_amount);
  });
  stakeWhiteListUsers.forEach((e) => {
    total = BigNumber.sum(total, e.stake_amount);
  })
  let upDateWhiteListUser = [];

  const allTotal = +whiteListUsers.length + stakeWhiteListUsers.length;

  if (allTotal <= project.$attributes.whitelist_trigger) {
    whiteListUsers.forEach((element) => {
      element.$attributes.allocation = project.$attributes.whitelist_untrigger;
    });

    upDateWhiteListUser = stakeWhiteListUsers.map((element) => {
      const staking = new StakingModel;
      staking.project_id = element.projectId;
      staking.wallet_address = element.wallet_address;
      staking.allocation = project.$attributes.whitelist_untrigger;
      staking.stake_amount = element.stake_amount;

      return staking;
    });
  } else {

    for (let i = 0; i < whiteListUsers.length; i++) {
        const userAmount = new BigNumber(
          whiteListUsers[i].$attributes.stake_amount
        );
        const stakePercent = userAmount.div(total).toFixed(10);
        whiteListUsers[i].$attributes.allocation = new BigNumber(stakePercent)
          .multipliedBy(project.$attributes.whitelist_hardcap)
          .toString();

        console.log('allocationWhitelist', whiteListUsers[i].$attributes.allocation);
      
    }

    for (let i = 0; i < stakeWhiteListUsers.length; i++) {
      const userAmount = new BigNumber(
        stakeWhiteListUsers[i].stake_amount
      );
      const stakePercent = userAmount.div(total).toFixed(10);
      const staking = new StakingModel;
      staking.project_id = stakeWhiteListUsers[i].projectId;
      staking.wallet_address = stakeWhiteListUsers[i].wallet_address;
      staking.allocation = new BigNumber(stakePercent)
      .multipliedBy(project.$attributes.whitelist_hardcap)
      .toString();
      staking.stake_amount = stakeWhiteListUsers[i].stake_amount;
      upDateWhiteListUser.push(staking);
  }
  }

  await Promise.all(
    whiteListUsers.map(async (e) => 
      await e.save()
    )
  );

  await Promise.all(
    upDateWhiteListUser.map(async (e) => await e.save())
  );
}

async function handleOtherUsers(otherUsers, project, contract) {
  let total = new BigNumber(0);

  await Promise.all(
    otherUsers.map(async (e) =>
      limit(async () => {
        e.$attributes.stake_amount = await contract.methods
          .userAmounts(e.$attributes.wallet_address)
          .call();
        return e;
      })
    )
  );

  otherUsers = otherUsers.filter((e) => e.$attributes.stake_amount > 0);

  if (otherUsers.length === 0) return;

  otherUsers.forEach((e) => {
    total = BigNumber.sum(total, e.$attributes.stake_amount);
  });

  if (otherUsers.length <= project.$attributes.other_trigger) {
    otherUsers.forEach((element) => {
      element.$attributes.allocation = project.$attributes.other_untrigger;
    });
  } else {
    const percents = [0];

    for (let i = 0; i < otherUsers.length; i++) {
      if (i === otherUsers.length - 1) {
        const latestPercent = 1 - _.sum(percents);
        otherUsers[i].$attributes.allocation = new BigNumber(latestPercent)
          .multipliedBy(project.$attributes.other_hardcap)
          .toString();
      } else {
        const userAmount = new BigNumber(
          otherUsers[i].$attributes.stake_amount
        );
        const stakePercent = userAmount.div(total).toFixed(10);
        otherUsers[i].$attributes.allocation = new BigNumber(stakePercent)
          .multipliedBy(project.$attributes.other_hardcap)
          .toString();
        percents.push(+stakePercent);
        console.log('allocationOther', otherUsers[i].$attributes.allocation);
      }
    }
  }

  await Promise.all(
    otherUsers.map(async (e) => 
      await e.save()
    )
  );
}

module.exports = caculateAllocationQueue;
