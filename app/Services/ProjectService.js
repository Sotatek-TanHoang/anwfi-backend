"use strict";

const ProjectModel = use('App/Models/Project');
const ProjectKeyModel = use('App/Models/ProjectKey');
const WhitelistModel = use('App/Models/WhitelistUser');
const StakeUserModel = use('App/Models/StakingPool');
const AirDropUserModel = use('App/Models/AirDrops');
const ConvertDateUtils = use("App/Common/ConvertDateUtils");
const { BigNumber } = require('bignumber.js');
const Database = use('Database');

const Config = use("Config");
const Const = use("App/Common/Const");
const moment = require("moment");
const HelperUtils = use("App/Common/HelperUtils");

const Web3 = require("web3");
const web3 = new Web3(process.env.URL_PROVIDER);
class ProjectService {

  async buildQueryBuilderUser(params) {

    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    now = moment(now).unix();
    let query = 
      `
      (SELECT is_display,
          project_name,
          start_time,
          registed_by,
          finish_time,
          announce_time,
          distribute_time,
          distribution_method,
          project_type,
          buy_type,
          project_information,
          id,
          title,
          updated_at,
          created_at,
          token_symbol,
          token_name,
          airdrop_fix_amount,
          token_address,
          whitelist_hardcap,
          other_hardcap,
          whitelist_trigger,
          other_trigger,
          whitelist_untrigger,
          other_untrigger,
          token_icon,
              CASE 
                WHEN start_time > ${now} THEN ${Const.STAKING_STATUS.AWAITING_STAKING}
                WHEN start_time <= ${now} AND finish_time > ${now} THEN ${Const.STAKING_STATUS.STAKING}
                WHEN announce_time > ${now} AND finish_time <= ${now} THEN ${Const.STAKING_STATUS.AWAITING_RESULT}
                WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.STAKING_STATUS.AWAITING_CLAIM}
                WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.STAKING_STATUS.CLAIM}
                WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.STAKING_STATUS.COMPLETED}
              END AS status,
              CASE 
                  WHEN start_time > ${now} THEN ABS(${now} - start_time)
                  WHEN start_time <= ${now} AND finish_time > ${now} THEN ABS(${now} - finish_time)
                  WHEN announce_time > ${now} AND finish_time <= ${now} THEN ABS(${now} - announce_time)
                  WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ABS(${now} - distribute_time)
                  WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ABS(${now} - (${Const.TWO_WEEKS_SECONDS} + distribute_time))
                  WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN 0
                END AS status_diff 
        FROM projects) AS project  
      `;

    let where = `WHERE is_display = ${Const.POOL_DISPLAY.DISPLAY} AND buy_type = ${Const.BUY_TYPE.STAKE} `;


    if(params.status) {
      let status = params.status.split(',') || [];
      const subWhere =  this.buildSearchStatus(status, now);
      where += 'AND ' + subWhere + ' ';
    }

    if(params.name ) {

      where += `AND (token_name LIKE '%${HelperUtils.escapeWildcards(params.name)}%' OR token_symbol LIKE '%${HelperUtils.escapeWildcards(params.name)}%') `;

    }

    if (params.registed) {
      where += `AND id IN (SELECT project_id from staking_projects WHERE wallet_address = '${HelperUtils.escapeWildcards(params.registed)}' 
                            UNION SELECT project_id from whitelist_users WHERE wallet_address = '${HelperUtils.escapeWildcards(params.registed)}') `;
    }

    const data = await Database.schema.raw(
      `
      SELECT * FROM
      ${query} ${where}
      ORDER BY abs(status-2), status, status_diff, created_at DESC
      LIMIT ${(params.page - 1) * params.limit}, ${params.limit}
      `
    );

    const total = await Database.schema.raw(
      `
      SELECT COUNT(*) AS total FROM ${query} ${where}
      `
    );

    let count = total[0][0].total;


    return {
      data: data[0],
      lastPage: Math.ceil(count / params.limit),
      page: params.page,
      perPage: params.limit,
      total: count
    }
  }

    /**
   * @param {page, limit, name, registed} params for filter follow status
   * @description return a query follow filter and search conditions
   * @returns query string
  */
    async buildQueryBuilderAdmin(params) {

      let now = moment().format('YYYY-MM-DD HH:mm:ss');
      now = moment(now).unix();
      let query = 
        `
        (SELECT 
            project_name,
            start_time,
            registed_by,
            finish_time,
            announce_time,
            distribute_time,
            distribution_method,
            project_type,
            buy_type,
            project_information,
            id,
            title,
            updated_at,
            created_at,
            token_symbol,
            token_name,
            airdrop_fix_amount,
            token_address,
            whitelist_hardcap,
            other_hardcap,
            whitelist_trigger,
            other_trigger,
            whitelist_untrigger,
            other_untrigger,
            token_icon,
                CASE 
                  WHEN start_time > ${now} THEN ${Const.STAKING_STATUS.AWAITING_STAKING}
                  WHEN start_time <= ${now} AND finish_time > ${now} THEN ${Const.STAKING_STATUS.STAKING}
                  WHEN announce_time > ${now} AND finish_time <= ${now} THEN ${Const.STAKING_STATUS.AWAITING_RESULT}
                  WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.STAKING_STATUS.AWAITING_CLAIM}
                  WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.STAKING_STATUS.CLAIM}
                  WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.STAKING_STATUS.COMPLETED}
                END AS status
          FROM projects) AS project  
        `;
  
      let where = `WHERE buy_type = ${Const.BUY_TYPE.STAKE} `;
  
  
      if(params.status) {
        let status = params.status.split(',') || [];
        const subWhere =  this.buildSearchStatus(status, now);
        where += 'AND ' + subWhere + ' ';
      }
  
      if(params.name ) {
  
        where += `AND (token_name LIKE '%${HelperUtils.escapeWildcards(params.name)}%' OR token_symbol LIKE '%${HelperUtils.escapeWildcards(params.name)}%') `;
  
      }
  
      if (params.registed) {
        where += `AND id IN (SELECT project_id from staking_projects WHERE wallet_address = '${HelperUtils.escapeWildcards(params.registed)}') `;
  
      }
  
      console.log('param', params.asset);
      let orderBy = `ORDER BY created_at DESC`
      if (params.asset) {
          orderBy = `ORDER BY token_name ${params.asset}, created_at DESC`
      }
      const data = await Database.schema.raw(
        `
        SELECT * FROM
        ${query} ${where}
        ${orderBy}
        LIMIT ${(params.page - 1) * params.limit}, ${params.limit}
        `
      );
  
      const total = await Database.schema.raw(
        `
        SELECT COUNT(*) AS total FROM ${query} ${where}
        `
      );
  
      let count = total[0][0].total;
  
  
      return {
        data: data[0],
        lastPage: Math.ceil(count / params.limit),
        page: params.page,
        perPage: params.limit,
        total: count
      }
    }

  /**
   * 
   * @param {*} where is exist query string  we need to concat below conditions
   * @param {*} status array number for status we need filter
   * @description // status type [1: Await STAKING, 2: STAKING, 3: Await result, 4: Await claim, 5: Claiming, 6: Completed]
   * @returns query string 
   */

  buildSearchStatus(status, now) {

    let subWhere = '';
    if(status[0] == Const.STAKING_STATUS.AWAITING_STAKING) {

      subWhere += `(start_time > ${now} ) `;
    }


    else if(status[0] == Const.STAKING_STATUS.STAKING) {

      subWhere += `(start_time <= ${now} AND finish_time > ${now}) `;
    }
    
    else if(status[0] == Const.STAKING_STATUS.AWAITING_RESULT) {

      subWhere += `(announce_time > ${now}) AND finish_time < ${now} `;
    }

    else if(status[0] == Const.STAKING_STATUS.AWAITING_CLAIM) {

      subWhere += `(announce_time <= ${now} AND distribute_time > ${now}) `;
    }


    else  if(status[0] == Const.STAKING_STATUS.CLAIM) {

      subWhere += `(distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now}) `;
    }

    else if(status[0] == Const.STAKING_STATUS.COMPLETED) {

      subWhere += `(distribute_time + ${Const.TWO_WEEKS_SECONDS} <= ${now}) `;
    }

      for(let i = 1; i < status.length; i++){
        
        if(status[i] == Const.STAKING_STATUS.AWAITING_STAKING) {
          subWhere += `OR (start_time > ${now} ) `;
        }
  
        else if(status[i] == Const.STAKING_STATUS.STAKING) {
          subWhere += `OR (start_time <= ${now} AND finish_time > ${now} ) `;
        }
  
        else if(status[i] == Const.STAKING_STATUS.AWAITING_RESULT) {
          subWhere += `OR (announce_time > ${now}) AND finish_time < ${now} `;
        }
  
        else if(status[i] == Const.STAKING_STATUS.AWAITING_CLAIM) {
          subWhere += `OR (announce_time <= ${now} AND distribute_time > ${now}) `;
        }
  
        else if(status[i] == Const.STAKING_STATUS.CLAIM) {
          subWhere += `OR (distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now}) `;
        }
        else if(status[i] == Const.STAKING_STATUS.COMPLETED) {
          subWhere += `OR (distribute_time + ${Const.TWO_WEEKS_SECONDS} <= ${now}) `;
        }
      }

    return '(' + subWhere + ') ';
  }

  // buildSearchQuery(params) {
  //   return this.buildQueryBuilder({
  //     ...params,
  //     is_search: true,
  //   });
  // }

  async findByProjectId(project_id) {
    return await ProjectModel.query().where({id: project_id}).first();
  }

  checkStatus(project) {
    // let now = moment().format("YYYY-MM-DD HH:mm:ss");
    let now = moment().unix();
    if(project.buy_type === Const.BUY_TYPE.STAKE) {
      project.status = Const.STAKING_STATUS.COMPLETED;
      if (now < project.start_time) {
        project.status = Const.STAKING_STATUS.AWAITING_STAKING;
      }
  
      if (project.start_time <= now && now <= project.finish_time) {
        project.status = Const.STAKING_STATUS.STAKING;
      }
  
      if (project.finish_time <= now && now <= project.announce_time) {
        project.status = Const.STAKING_STATUS.AWAITING_RESULT;
      }
  
      if (project.announce_time <= now && now <= project.distribute_time) {
        project.status = Const.STAKING_STATUS.AWAITING_CLAIM;
      }
  
      if (project.distribute_time <= now && now <= parseInt(project.distribute_time) + Const.TWO_WEEKS_SECONDS) {
        project.status = Const.STAKING_STATUS.CLAIM;
      }
    } else {
      project.status = Const.AIRDROP_STATUS.COMPLETED;

      if(project.project_type == Const.PROJECT_TYPE.PUBLIC) {
        if (now < project.start_time) {
          project.status = Const.AIRDROP_STATUS.AWAITING_APPLICATION;
        }
    
        if (project.start_time <= now && now <= project.finish_time) {
          project.status = Const.AIRDROP_STATUS.APPLICATION;
        }
      }
      
      if(project.distribution_method != Const.DISTRIBUTION_METHOD.FIXED_AMOUNT) {

        if(project.project_type == Const.PROJECT_TYPE.PUBLIC) {
          if (project.finish_time <= now && now <= project.announce_time) {
            project.status = Const.AIRDROP_STATUS.AWAITING_RESULT;
          }
        } else {
          if (now <= project.announce_time) {
            project.status = Const.AIRDROP_STATUS.AWAITING_RESULT;
          }
        }

        if (project.announce_time <= now && now <= project.distribute_time) {
          project.status = Const.AIRDROP_STATUS.AWAITING_CLAIM;
        }
      }
  
      if (project.distribution_method == Const.DISTRIBUTION_METHOD.FIXED_AMOUNT) {
        if (now <= project.distribute_time) {
          project.status = Const.AIRDROP_STATUS.AWAITING_CLAIM;
        }
      }
  
      if (project.distribute_time <= now && now <= parseInt(project.distribute_time) + Const.TWO_WEEKS_SECONDS) {
        project.status = Const.AIRDROP_STATUS.CLAIM;
      }
    }
  
  }

  async statistical() {

    const now = moment().unix();

    let query = 
    `
    SELECT 
        CASE 
          WHEN start_time > ${now} THEN ${Const.STAKING_STATUS.AWAITING_STAKING}
          WHEN start_time <= ${now} AND finish_time > ${now} THEN ${Const.STAKING_STATUS.STAKING}
          WHEN announce_time > ${now} AND finish_time <= ${now} THEN ${Const.STAKING_STATUS.AWAITING_RESULT}
          WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.STAKING_STATUS.AWAITING_CLAIM}
          WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.STAKING_STATUS.CLAIM}
          WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.STAKING_STATUS.COMPLETED}
        END AS status, 
    COUNT(id) AS total

    FROM  projects
    WHERE buy_type = ${Const.BUY_TYPE.STAKE}
    GROUP BY status;
    `

    const data = await Database.schema.raw(query);
    let result = {}

    const format = JSON.parse(JSON.stringify(data[0]));

    for( const e of format) {
      if(e.status === Const.STAKING_STATUS.AWAITING_STAKING ) result['AWAITING_STAKING'] = e.total;
      if(e.status === Const.STAKING_STATUS.STAKING ) result['STAKING'] = e.total;
      if(e.status === Const.STAKING_STATUS.AWAITING_RESULT ) result['AWAITING_RESULT'] = e.total;
      if(e.status === Const.STAKING_STATUS.AWAITING_CLAIM ) result['AWAITING_CLAIM'] = e.total;
      if(e.status === Const.STAKING_STATUS.CLAIM ) result['CLAIM'] = e.total;
      if(e.status === Const.STAKING_STATUS.COMPLETED) result['COMPLETED'] = e.total;
    }
    

    return result;
  }

  async createRandomProjectKey(project_id, privateKey) {
    const data = {
      project_id: project_id,
      key: privateKey
    }
    const projectKey = await ProjectKeyModel.create(data);
    return projectKey;
  }

  async findProjectKeyByProjectID(project_id) {

    return await ProjectKeyModel
    .query()
    .where({project_id: project_id})
    .first();
 }

 async findProjectByProjectID(project_id) {

  return await ProjectModel
  .query()
  .where('id', '=', project_id)
  .whereNotNull('project_contract_address')
  .first();
}

  async getAmount(project, wallet_address) {
  if(project.buy_type === Const.BUY_TYPE.STAKE) {
    return await StakeUserModel.query()
    .select('wallet_address', 'allocation')
    .where({project_id: project.id, wallet_address})
    .first()
  }

  if(project.buy_type === Const.BUY_TYPE.AIRDROP) {
    let result
    if(project.distribution_method == Const.DISTRIBUTION_METHOD.FIXED_AMOUNT && project.project_type == Const.PROJECT_TYPE.PRIVATE) {
      result = await WhitelistModel.query()
                          .select('wallet_address')
                          .where({project_id: project.id, wallet_address})
                          .first()
    const checkWallet = await AirDropUserModel.query().where({project_id: project.id, wallet_address}).first();
    if(!checkWallet) {
      let allocation = new BigNumber(project.token_conversion_rate).multipliedBy(new BigNumber(10).pow(18)).toLocaleString('fullwide', {useGrouping:false});
      await AirDropUserModel.create({project_id: project.id, wallet_address, allocation});
    }

    if(result) {
      result.allocation = new BigNumber(project.token_conversion_rate).multipliedBy(new BigNumber(10).pow(18))
    }

    return result;

    } else {
      if(project.distribution_method == Const.DISTRIBUTION_METHOD.FIXED_AMOUNT) {
        let result = await AirDropUserModel.query()
        .select('wallet_address', 'id')
        .where({project_id: project.id, wallet_address})
        .first()

        if(result) {
          result.allocation = new BigNumber(project.token_conversion_rate).multipliedBy(new BigNumber(10).pow(18)).toLocaleString('fullwide', {useGrouping:false})
        }
        
        await result.save();
        return result;
      }

      return await AirDropUserModel.query()
      .select('wallet_address', 'allocation')
      .where({project_id: project.id, wallet_address})
      .first()
    }

    } else {
      return await AirDropUserModel.query()
      .select('wallet_address', 'allocation')
      .where({project_id: project.id, wallet_address})
      .first()
    }
  }

  async getAmountContract(projects) {
    const abi = require('../abi/Erc20.json');
    const TOKEN_ADDRESS = projects.token_address;
    const contract = new web3.eth.Contract(abi, TOKEN_ADDRESS);
    let result =  await contract.methods.balanceOf(projects.project_contract_address).call();
    let amountReward = await this.getAmountClaim(projects);
    console.log('token contract', result);
    return (result - amountReward);
  }

  async getAmountClaim(projects) {
    try {
      let totalRaiseAmount = new BigNumber(0);
      //Staking
      if(projects.buy_type === Const.BUY_TYPE.STAKE) {
        let result =  await StakeUserModel.query()
        .select('wallet_address', 'allocation')
        .where({project_id: projects.id, status: 0})
        .fetch()
        result.rows.map(e => {
          if(e.allocation > 0) {
            totalRaiseAmount = BigNumber.sum(totalRaiseAmount, e.allocation)
          }
        } 
        )
        return totalRaiseAmount.toString();

      } else {
        // Airdrop
        if(projects.distribution_method === Const.DISTRIBUTION_METHOD.FIXED_AMOUNT){
          if(projects.project_type === Const.PROJECT_TYPE.PRIVATE) {
            let noOfParticipants = await this.countParticipantsPrivate(projects.id)
            totalRaiseAmount = new BigNumber(projects.token_conversion_rate).multipliedBy(noOfParticipants).multipliedBy(new BigNumber(10).pow(18))
            return totalRaiseAmount.toString();

          } else if (projects.project_type === Const.PROJECT_TYPE.PUBLIC) {
              let noOfParticipants = await this.countParticipantsPublic(projects.id)
              totalRaiseAmount = new BigNumber(projects.token_conversion_rate).multipliedBy(noOfParticipants).multipliedBy(new BigNumber(10).pow(18))
              return totalRaiseAmount.toString();
          }

        }else{
          let result =  await AirDropUserModel.query()
          .select('wallet_address', 'allocation')
          .where({project_id: projects.id, status: 0})
          .fetch()
          result.rows.map(e => {
            if(e.allocation > 0) {
              totalRaiseAmount = BigNumber.sum(totalRaiseAmount, e.allocation)
            }
          }
          )
          return totalRaiseAmount.toString();
        }

      }

    } catch (error) {
      return HelperUtils.responseErrorInternal(error);
    }
  }

  async findOtherStakeUserById(projectId, page, limit) {
    const query = StakeUserModel.query()
      .select()
      .where("project_id", projectId);

    return await query.paginate(page, limit);
  }

  async findWhiteListUsersByProjectId(projectId, page, limit) {
    const query = WhitelistModel.query()
      .select()
      .where("project_id", projectId);

    return await query.paginate(page, limit);
  }

  async findAllStakeUsers(projectId, page, limit) {

    const arr1 = await this.findWhiteListUsersByProjectId(projectId);
    const arr2 = await this.findOtherStakeUserById(projectId);
    
    const total = +arr1.pages.total + +arr2.pages.total;


    const query = await Database.schema.raw(
      `
      SELECT * FROM (
        SELECT  id,
                wallet_address,
                project_id,
                stake_amount,
                allocation,
                'other' as type
        FROM staking_projects
        WHERE project_id = ${projectId}
        UNION

        SELECT  id,
                wallet_address,
                project_id,
                stake_amount,
                allocation,
                'whitelist' as type
        FROM whitelist_users
        WHERE project_id = ${projectId}
      ) AS final

      LIMIT ${(page-1) * limit }, ${limit}
      `
    )
      
      return {
        total: total,
        data:  query[0]
      }
  }

  async findProjectEndToDay() {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const tommorow = moment(today).add(1, 'd').format('YYYY-MM-DD');
    const todayUnix = moment(today).unix();
    const tommorowUnix = moment(tommorow).unix();

    const builder = ProjectModel.query()
                          .where('finish_time', '>=', todayUnix)
                          .andWhere('finish_time', '<', tommorowUnix)
                          .andWhere('buy_type', Const.BUY_TYPE.STAKE)
                          .andWhere('status_deploy', Const.STATUS_DEPLOY.HAS_DEPLOYED);

    return await builder.fetch();
  }

  async findAirDropEndToDay() {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const tommorow = moment(today).add(1, 'd').format('YYYY-MM-DD');

    
    const todayUnix = moment(today).unix();
    const tommorowUnix = moment(tommorow).unix();

    const builder = ProjectModel.query()
                                .where('buy_type', Const.BUY_TYPE.AIRDROP)
                                .andWhereNot('distribution_method', Const.DISTRIBUTION_METHOD.FIXED_AMOUNT)
                                .andWhere('status_deploy', Const.STATUS_DEPLOY.HAS_DEPLOYED)
                                .andWhere('snapshot_time', '>=', todayUnix)
                                .andWhere('snapshot_time', '<', tommorowUnix);


    return await builder.fetch();
  }

  async countParticipantsPrivate(project_id) {
    let whiteListNotClaim = await WhitelistModel.query()
    .select('wallet_address')
    .where({'project_id': project_id})
    .fetch();
    whiteListNotClaim = JSON.parse(JSON.stringify(whiteListNotClaim));

    let airDropClaim = await AirDropUserModel.query()
    .select('wallet_address')
    .where({'project_id': project_id, 'status': 1})
    .fetch();
    airDropClaim = JSON.parse(JSON.stringify(airDropClaim));

    // filter user claimed
    const result = whiteListNotClaim.filter(item1 => 
      !airDropClaim.some(item2 => (item2.wallet_address === item1.wallet_address )));
    return result.length;
  }

  async countParticipantsPublic(project_id) {
   let airDropNotClaim = await AirDropUserModel.query()
    .where({'project_id': project_id, 'status': 0}).fetch();
    const result = JSON.parse(JSON.stringify(airDropNotClaim));
    return result.length;
  }

}

module.exports = ProjectService;
