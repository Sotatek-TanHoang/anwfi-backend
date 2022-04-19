const Const = use('App/Common/Const');
const AirDropModel = use('App/Models/AirDrops')
const WhitelistModel = use('App/Models/WhitelistUser');
const moment = require('moment');
const Database = use('Database');
const BaseService = use('App/Services/BaseService');
const HelperUtils = use("App/Common/HelperUtils");
class AirDropService extends BaseService  {

  /**
   * @param {page, limit, name, registed} params for filter follow status, type for check is display or not
   * @description return a query follow filter and search conditions
   * @returns query string
  */
  async buildQueryBuilder(params) {

    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    now = moment(now).unix();
    let query = 
      `
      (SELECT  is_display,
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
              total_raise_amount,
              token_icon,
              is_priority,
              token_conversion_rate,
              snapshot_time,
              CASE 
                  WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.FIXED_AMOUNT}
                    THEN
                      CASE
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
                        WHEN distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM} 
                        WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
                        WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED}
                      END
                  WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC} 
                    THEN
                      CASE 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
                        WHEN announce_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_RESULT}
                        WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM}
                        WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
                        WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED} 
                      END
                END AS status
        FROM projects) AS project  
      `;

    let where = `WHERE is_display = ${Const.POOL_DISPLAY.DISPLAY} AND buy_type = ${Const.BUY_TYPE.AIRDROP} `;


    if(params.status) {
      let status = params.status.split(',') || [];
      const subWhere =  this.buildSearchStatus(status, now);
      where += 'AND ' + subWhere + ' ';
    }

    if(params.name ) {
      where += `AND (token_name LIKE '%${HelperUtils.escapeWildcards(params.name)}%' OR token_symbol LIKE '%${HelperUtils.escapeWildcards(params.name)}%') `;
    }

    if (params.registed) {
      where += `AND id IN (SELECT project_id from airdrops WHERE wallet_address = '${HelperUtils.escapeWildcards(params.registed)}'
                            UNION SELECT project_id from whitelist_users WHERE wallet_address = '${HelperUtils.escapeWildcards(params.registed)}') `;
    }

    const data = await Database.schema.raw(
      `
      SELECT * FROM
      ${query} ${where}
      ORDER BY status, created_at DESC
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
                total_raise_amount,
                token_icon,
                is_priority,
                token_conversion_rate,
                snapshot_time,
                CASE 
                  WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.FIXED_AMOUNT} 
                    THEN
                      CASE
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
                        WHEN distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM} 
                        WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
                        WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED}
                      END
                  WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC} 
                    THEN
                      CASE 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
                        WHEN announce_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_RESULT}
                        WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM}
                        WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
                        WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED} 
                      END
                END AS status
          FROM projects) AS project  
        `;
  
      let where = `WHERE buy_type = ${Const.BUY_TYPE.AIRDROP} `;
  
  
      if(params.status) {
        let status = params.status.split(',') || [];
        const subWhere =  this.buildSearchStatus(status, now);
        where += 'AND ' + subWhere + ' ';
      }
  
      if(params.name ) {
  
        where += `AND (token_name LIKE '%${HelperUtils.escapeWildcards(params.name)}%' OR token_symbol LIKE '%${HelperUtils.escapeWildcards(params.name)}%') `;
  
      }
  
      if (params.registed) {
        where += `AND id IN (SELECT project_id from airdrops WHERE wallet_address = '${HelperUtils.escapeWildcards(params.registed)}') `;
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
   * @description // status type [1: Await application, 2: application, 3: Await result, 4: Await claim, 5: Claiming, 6: Completed]
   * @returns query string 
   */

  buildSearchStatus(status, now) {

    let subWhere = '';
    if(status[0] == Const.AIRDROP_STATUS.AWAITING_APPLICATION) {

      subWhere += `(start_time > ${now} AND project_type = ${Const.PROJECT_TYPE.PUBLIC}) `;
    }


    else if(status[0] == Const.AIRDROP_STATUS.APPLICATION) {

      subWhere += `(start_time <= ${now} AND finish_time > ${now} AND project_type = ${Const.PROJECT_TYPE.PUBLIC}) `;
    }
    
    else if(status[0] == Const.AIRDROP_STATUS.AWAITING_RESULT) {

      subWhere += `(announce_time > ${now} AND project_type = ${Const.PROJECT_TYPE.PRIVATE}
        AND (distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC})) 
        OR (announce_time > ${now} AND finish_time < ${now} AND project_type = ${Const.PROJECT_TYPE.PUBLIC}
          AND (distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC}))`;
    }

    else if(status[0] == Const.AIRDROP_STATUS.AWAITING_CLAIM) {

      subWhere += `((distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} 
                    OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC}) 
                    AND announce_time <= ${now} AND distribute_time > ${now}) 
                    OR
                    ( distribution_method = ${Const.DISTRIBUTION_METHOD.FIXED_AMOUNT}
                      AND ((project_type = ${Const.PROJECT_TYPE.PUBLIC} AND finish_time <= ${now} AND distribute_time > ${now}) OR (project_type = ${Const.PROJECT_TYPE.PRIVATE} AND distribute_time > ${now}))
                    ) `;
    }


    else  if(status[0] == Const.AIRDROP_STATUS.CLAIM) {

      subWhere += `(distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now}) `;
    }

    else if(status[0] == Const.AIRDROP_STATUS.COMPLETED) {

      subWhere += `(distribute_time + ${Const.TWO_WEEKS_SECONDS} <= ${now}) `;
    }

      for(let i = 1; i < status.length; i++){
        
        if(status[i] == Const.AIRDROP_STATUS.AWAITING_APPLICATION) {
          subWhere += `OR (start_time > ${now} AND project_type = ${Const.PROJECT_TYPE.PUBLIC}) `;
        }
  
        else if(status[i] == Const.AIRDROP_STATUS.APPLICATION) {
          subWhere += `OR (start_time <= ${now} AND finish_time > ${now} AND project_type = ${Const.PROJECT_TYPE.PUBLIC}) `;
        }
  
        else if(status[i] == Const.AIRDROP_STATUS.AWAITING_RESULT) {
          subWhere += `OR (announce_time > ${now} AND project_type = ${Const.PROJECT_TYPE.PRIVATE}
            AND (distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC}))
            OR (announce_time > ${now} AND finish_time < ${now} AND project_type = ${Const.PROJECT_TYPE.PUBLIC}
              AND (distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC}))
            `;
        }
  
        else if(status[i] == Const.AIRDROP_STATUS.AWAITING_CLAIM) {
          subWhere += `OR ((distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} 
            OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC}) 
            AND announce_time <= ${now} AND distribute_time > ${now}) 
            OR
            ( distribution_method = ${Const.DISTRIBUTION_METHOD.FIXED_AMOUNT}
              AND ((project_type = ${Const.PROJECT_TYPE.PUBLIC} AND finish_time <= ${now} AND distribute_time > ${now}) OR (project_type = ${Const.PROJECT_TYPE.PRIVATE} AND distribute_time > ${now}))
            ) `;
        }
  
        else if(status[i] == Const.AIRDROP_STATUS.CLAIM) {
          subWhere += `OR (distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now}) `;
        }
        else if(status[i] == Const.AIRDROP_STATUS.COMPLETED) {
          subWhere += `OR (distribute_time + ${Const.TWO_WEEKS_SECONDS} <= ${now}) `;
        }
      }

    return '(' + subWhere + ') ';
  }

  /**
   * @description get each status type of airdrop projects
   * @argument status: [1: Await application, 2: application, 3: Await result, 4: Await claim, 5: Claiming, 6: Completed]
   * @returns nothing
   */
  async statistical() {

    const now = moment().unix();

    let query = 
    `
    SELECT 
      CASE 
        WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.FIXED_AMOUNT} 
          THEN
            CASE
              WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION}
              WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
              WHEN distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM} 
              WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
              WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED}
            END
        WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC} 
          THEN
            CASE 
              WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
              WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
              WHEN announce_time > ${now} AND (distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC}) THEN ${Const.AIRDROP_STATUS.AWAITING_RESULT}
              WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM}
              WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
              WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED} 
            END
    END AS status,
    COUNT(id) AS total

    FROM  projects
    WHERE buy_type = ${Const.BUY_TYPE.AIRDROP}
    GROUP BY status;
    `

    const data = await Database.schema.raw(query);
    let result = {}

    const format = JSON.parse(JSON.stringify(data[0]));

    for( const e of format) {
      if(e.status === Const.AIRDROP_STATUS.AWAITING_APPLICATION ) result['AWAITING_APPLICATION'] = e.total;
      if(e.status === Const.AIRDROP_STATUS.APPLICATION ) result['APPLICATION'] = e.total;
      if(e.status === Const.AIRDROP_STATUS.AWAITING_RESULT ) result['AWAITING_RESULT'] = e.total;
      if(e.status === Const.AIRDROP_STATUS.AWAITING_CLAIM ) result['AWAITING_CLAIM'] = e.total;
      if(e.status === Const.AIRDROP_STATUS.CLAIM ) result['CLAIM'] = e.total;
      if(e.status === Const.AIRDROP_STATUS.COMPLETED) result['COMPLETED'] = e.total;
    }
    

    return result;
  }

  async getProjectAirdropDetail(projectId, is_display){
    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    now = moment(now).unix();
    let query = `
    (
      SELECT 
                project_name, start_time, registed_by, finish_time, announce_time, distribute_time, distribution_method,
                project_type, buy_type, project_information, id, title, updated_at, created_at, token_symbol, token_name,
                airdrop_fix_amount, token_address, total_raise_amount, token_icon, token_conversion_rate,
                snapshot_time, status_deploy, is_display,project_contract_address,is_priority,
                twitter_link, telegram_link, medium_link, whitepaper_link, website,transaction_hash,
                CASE 
                  WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.FIXED_AMOUNT} 
                    THEN
                      CASE
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
                        WHEN distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM} 
                        WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
                        WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED}
                      END
                  WHEN distribution_method = ${Const.DISTRIBUTION_METHOD.LINEAR} OR distribution_method = ${Const.DISTRIBUTION_METHOD.QUADRATIC} 
                    THEN
                      CASE 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_APPLICATION} 
                        WHEN project_type = ${Const.PROJECT_TYPE.PUBLIC} AND start_time <= ${now} AND finish_time > ${now} THEN ${Const.AIRDROP_STATUS.APPLICATION}
                        WHEN announce_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_RESULT}
                        WHEN announce_time <= ${now} AND distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.AWAITING_CLAIM}
                        WHEN distribute_time <= ${now} AND ${Const.TWO_WEEKS_SECONDS} + distribute_time > ${now} THEN ${Const.AIRDROP_STATUS.CLAIM}
                        WHEN ${Const.TWO_WEEKS_SECONDS} + distribute_time <= ${now} THEN ${Const.AIRDROP_STATUS.COMPLETED} 
                      END
                END AS status 
          FROM projects ) AS project`;

    let where = `WHERE id = ${projectId} AND buy_type = ${Const.BUY_TYPE.AIRDROP}`;
    if (is_display === Const.POOL_DISPLAY.DISPLAY){
      where += ` AND is_display = ${Const.POOL_DISPLAY.DISPLAY}`;
    }

    const data =  await Database.schema.raw(
        `
        SELECT * FROM 
        ${query}
        ${where}
        LIMIT 1
        `
    )

    let result = JSON.parse(JSON.stringify(data[0]));
    return result[0];
  }

  async checkWalletJoinAirdrop(projectId, wallet) {
    const checkWallet = await AirDropModel.query().where({project_id: projectId, wallet_address: wallet}).first();
    let status_join = 0;
    let status_claim;
    if(checkWallet) {
      status_join = 1;
      status_claim = checkWallet.status;

    }
    let result = {
      status_join,
      status_claim
    }
    return result;
  }

  async updateStatusWalletJoinAirdrop(projectId, wallet_address) {
    let wallet = await AirDropModel.query().where({project_id: projectId, wallet_address: wallet_address, status: 0}).first();
    if (wallet){
      wallet.status = 1;
      wallet.save();
    }
    return wallet;
  }

  async countByProjectId(project_id, project_type) {
    if(project_type == Const.PROJECT_TYPE.PRIVATE) {
      return await WhitelistModel.query().
      where('project_id', project_id).getCount();
    } else {
      return await AirDropModel.query().
      where('project_id', project_id).getCount();
    }
  }

  async builderAmount(projectList) {
    let query = 
    `select * from 
      (select count(wallet_address) as total_paticipant, project_id from whitelist_users GROUP BY project_id
      UNION 
      select count(wallet_address), project_id from airdrops GROUP BY project_id)
      as project_count where project_count.project_id in(${projectList});`

    const data = await Database.schema.raw(
      `
      ${query}
      `
    );

    return data[0]
  }

}

module.exports = AirDropService;