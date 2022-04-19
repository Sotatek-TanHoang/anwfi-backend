const Queue = require("bull");
const _ = require("lodash");
const { BigNumber } = require("bignumber.js");
const Const = use("App/Common/Const");
const ProjectService = use("App/Services/ProjectService");
const AirDropsModel = use("App/Models/AirDrops");
const Web3 = require("web3");
const pLimit = require("../Common/ProcessLimit");
const limit = pLimit(Const.LIMIT_PROCESS_NUMBER);
const WhitelistService = use("App/Services/WhitelistUserService");

const web3 = new Web3(process.env.URL_PROVIDER);
let caculateAirDropsQueue;

try {
  caculateAirDropsQueue = new Queue(Const.AIR_DROPS_CACULATION_QUEUE, {
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
} catch (e) {
  console.log(e);
}

BigNumber.config({ ROUNDING_MODE: 1 });

caculateAirDropsQueue.process(async (job) => {
  try {
    console.log("------Processing Air Drop Caculation, Job-Id:", job.id);

    const projectId = job.data;
    const projectService = new ProjectService();

    const project = await projectService.findByProjectId(projectId);

    if (!project || !project.$attributes.project_contract_address) {
      console.log("no need to caculate");
      return;
    }

    console.log(
      "----------Project distribution_method is: ",
      project.$attributes.distribution_method
    );

    switch (project.$attributes.distribution_method) {
      case Const.DISTRIBUTION_METHOD.LINEAR: {
        await handleLinerType(
          projectId,
          project
        );
        break;
      }

      case Const.DISTRIBUTION_METHOD.QUADRATIC: {
        await handleQuadraticType(
          projectId,
          project
          );
        break;
      }

      default: {
        console.log("Wrong type in project, check it again");
      }
    }
  } catch (e) {
    console.log("ERROR: ", e);
    job.moveToFailed(`ERROR: ${JSON.parse(e)}`, false);
  }
});



async function handleQuadraticType(projectId, project) {
  
  let totalRaiseAmount = new BigNumber(0);

  const whitelistService = new WhitelistService();

  if(project.$attributes.project_type == Const.PROJECT_TYPE.PRIVATE) {
    const whitelist = JSON.parse(JSON.stringify(await whitelistService.getWhiteListByProjectId(projectId)));

    const updateAirDrops = await Promise.all(
      whitelist.map(async (e) =>
        limit(async () => {
          const airDrop = new AirDropsModel;
          const address = e.wallet_address;
          const roseInAccount = await queryBalance(address);
  
          airDrop.amount = roseInAccount;
          airDrop.allocation = new BigNumber(roseInAccount)
            .div(new BigNumber(10).pow(18))
            .squareRoot()
            .multipliedBy(new BigNumber(10).pow(18))
            .toFixed(0);
          airDrop.wallet_address = address;
          airDrop.project_id = projectId;
          totalRaiseAmount = BigNumber.sum(totalRaiseAmount, airDrop.allocation);
          return airDrop;
        })
      )
    );

    await Promise.all(
      updateAirDrops.map(async (e) => 
        await e.save()
      )
    );

  }

  else {
    const query = AirDropsModel.query().where("project_id", projectId);

    const airDrops = await query.fetch();

    const updateAirDrops = await Promise.all(
      airDrops.rows.map(async (e) =>
        limit(async () => {
          const address = e.$attributes.wallet_address;
          const roseInAccount = await queryBalance(address);

          e.$attributes.amount = roseInAccount;
          e.$attributes.allocation = new BigNumber(roseInAccount)
            .div(new BigNumber(10).pow(18))
            .squareRoot()
            .multipliedBy(new BigNumber(10).pow(18))
            .toFixed(0);

          totalRaiseAmount = BigNumber.sum(totalRaiseAmount, e.$attributes.allocation);
          return e;
        })
      )
    );

    await Promise.all(
      updateAirDrops.map(async (e) => 
        await e.save()
      )
    );
  }
  

  project.$attributes.total_raise_amount = totalRaiseAmount.toString();

  await project.save();
}

async function handleLinerType(projectId, project) {
  
  let totalRaiseAmount = new BigNumber(0);
  
  const whitelistService = new WhitelistService();

  if(project.$attributes.project_type == Const.PROJECT_TYPE.PRIVATE) {
    const whitelist = JSON.parse(JSON.stringify(await whitelistService.getWhiteListByProjectId(projectId)));
    
    const updateAirDrops = await Promise.all(
      whitelist.map(async (e) =>
        limit(async () => {
          const airDrop = new AirDropsModel;
          const address = e.wallet_address;
          const roseInAccount = await queryBalance(address);
  
          airDrop.amount = roseInAccount;
          airDrop.allocation = new BigNumber(roseInAccount)
            .div(project.$attributes.token_conversion_rate)
            .toFixed(2);
          airDrop.wallet_address = address;
          airDrop.project_id = projectId;
          totalRaiseAmount = BigNumber.sum(totalRaiseAmount, airDrop.allocation);
  
          return airDrop;
        })
      )
    );
  
    await Promise.all(
      updateAirDrops.map(async (e) => 
        await e.save()
      )
    );
  }

  else {
    const query = AirDropsModel.query().where("project_id", projectId);

    const airDrops = await query.fetch();


    const updateAirDrops = await Promise.all(
      airDrops.rows.map(async (e) =>
        limit(async () => {
          const address = e.$attributes.wallet_address;
          const roseInAccount = await queryBalance(address);

          e.$attributes.amount = roseInAccount;
          e.$attributes.allocation = new BigNumber(roseInAccount)
            .div(project.$attributes.token_conversion_rate)
            .toFixed(2);
          totalRaiseAmount = BigNumber.sum(totalRaiseAmount, e.$attributes.allocation);

          return e;
        })
      )
    );

    await Promise.all(
      updateAirDrops.map(async (e) => 
        await e.save()
      )
    );
  }
  

  project.$attributes.total_raise_amount = totalRaiseAmount.toString();

  await project.save();
}

async function queryBalance(address) {
  return await web3.eth.getBalance(address);
}

module.exports = caculateAirDropsQueue;
