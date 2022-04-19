'use strict'

const WhitelistModel = use('App/Models/WhitelistUser');
const Const = use('App/Common/Const');
const fs = require("fs");
const Database = use('Database');

class WhitelistUserService {
  buildQueryBuilder(params) {
    // create query
    let builder = WhitelistModel.query();
    if (params.id) {
      builder = builder.where('id', params.id);
    }
    if (params.email) {
      builder = builder.where('email', params.email);
    }
    if (params.wallet_address) {
      builder = builder.where('wallet_address', params.wallet_address);
    }
    if (params.project_id) {
      builder = builder.where('project_id', params.project_id);
    }

    // For search box
    if (params.search_term) {
      builder = builder.where(query => {
        query.where('wallet_address', 'like', '%' + params.search_term + '%')
          .orWhere('email', 'like', '%' + params.search_term + '%');
      })
    }

    return builder;
  }

  buildSearchQuery(params) {
    let builder = WhitelistModel.query();
    if (params.email) {
      builder = builder.where('email', 'like', '%' + params.email + '%');
    }
    if (params.wallet_address) {
      builder = builder.where('wallet_address', 'like', '%' + params.wallet_address + '%')
    }
    if (params.project_id) {
      builder = builder.where('project_id', params.project_id);
    }
    return builder;
  }

  async getWhiteListByProjectId(projectId) {
    const builder = WhitelistModel.query(
                                    'wallet_address'
                                  )
                                  .where('project_id', projectId);
    return await builder.fetch();
  }

  async findParticipantsForStaking(params) {
    let queryWhitelist = `SELECT
          ws1.wallet_address,
          ws1.project_id,
          1 as type_user,
          SUM(sp1.stake_amount) as amount,
          SUM(sp1.allocation) as allocation,
          MAX(ws1.created_at) as created_at
      FROM
          whitelist_users ws1
      LEFT JOIN staking_projects sp1
            ON
          ws1.project_id = sp1.project_id
        AND ws1.wallet_address = sp1.wallet_address
      WHERE
          ws1.project_id = ${params.projectId}
      GROUP BY
          ws1.project_id,
          ws1.wallet_address`;

    let queryOther = `SELECT
          sp2.wallet_address,
          sp2.project_id,
          2 as type_user,
          SUM(sp2.stake_amount) as amount,
          SUM(sp2.allocation) as allocation,
          MAX(sp2.created_at) as created_at
      FROM
          staking_projects sp2
      WHERE
          sp2.project_id = ${params.projectId}
        AND sp2.wallet_address NOT IN (
        SELECT
            wu2.wallet_address
        FROM
            whitelist_users wu2
        WHERE
            wu2.project_id = ${params.projectId})
      GROUP BY
          sp2.project_id,
          sp2.wallet_address`;
    let query;

    if (Const.PROJECT_TYPE.PRIVATE  == params.projectType) {
      query = `( ${queryWhitelist} ) AS final`;
    } else if (Const.PROJECT_TYPE.PUBLIC  == params.projectType) {
      query = `( ${queryOther} ) AS final`;
    } else {
      query = `( ${queryWhitelist} UNION ${queryOther} ) AS final`;
    }

    if (params.isExportCsv === true) {
      const dataCsv = await Database.schema.raw(
        `SELECT * FROM  ${query}
        ORDER BY final.type_user DESC, final.created_at DESC`
      );
      return dataCsv[0];
    }

    let where = '';
    if (params.typeUser == 1) {
      where = 'WHERE final.type_user = 1';
    } else if (params.typeUser == 2) {
      where = 'WHERE final.type_user = 2';
    }

    const data = await Database.schema.raw(
      `SELECT * FROM  ${query}
      ${where}
      ORDER BY final.type_user DESC, final.created_at DESC
      LIMIT ${(params.page-1) * params.limit }, ${params.limit}`
    );

    const countTotal = await Database.schema.raw(
      `SELECT COUNT(*) As total FROM  ${query} ${where}`
    );
    
    let count = countTotal[0][0].total;
    return {
      data:  data[0],
      lastPage: Math.ceil(count / params.limit),
      page: params.page,
      perPage: params.limit,
      total: count,
    }
  }

  async findParticipantsForAirdrop(params) {
    let query;
    if (Const.PROJECT_TYPE.PRIVATE  == params.projectType) {
      // Get from whitelist_users table
      query = `(SELECT
        ws.wallet_address,
        ws.project_id,
        1 as type_user,
        SUM(sp.amount) as amount,
        SUM(sp.allocation) as allocation,
        MAX(ws.created_at) as created_at
      FROM
        whitelist_users ws
      LEFT JOIN airdrops sp
                  ON
        ws.project_id = sp.project_id
        AND ws.wallet_address = sp.wallet_address
      WHERE
        ws.project_id = ${params.projectId}
      GROUP BY
        ws.project_id,
        ws.wallet_address) as tmp`;
    } else {
      // Get from airdrops table
      query = `(SELECT
        a.wallet_address,
        a.project_id,
        2 as type_user,
        SUM(a.amount) as amount,
        SUM(a.allocation) as allocation,
        MAX(a.created_at) as created_at
      FROM
        airdrops a
      WHERE
        a.project_id = ${params.projectId}
      GROUP BY
        a.project_id,
        a.wallet_address) as tmp`;
    }

    if (params.isExportCsv === true) {
      const dataCsv = await Database.schema.raw(
        `SELECT * FROM  ${query}
        ORDER BY tmp.type_user DESC, tmp.created_at DESC`
      );
      return dataCsv[0];
    }

    const data = await Database.schema.raw(
      `SELECT * FROM  ${query}
      ORDER BY tmp.type_user DESC, tmp.created_at DESC
      LIMIT ${(params.page-1) * params.limit }, ${params.limit}`
    );

    const countTotal = await Database.schema.raw(
      `SELECT COUNT(*) As total FROM  ${query}`
    );
    
    let count = countTotal[0][0].total;
    return {
      data:  data[0],
      lastPage: Math.ceil(count / params.limit),
      page: params.page,
      perPage: params.limit,
      total: count,
    }
  }

  async countByCampaignId(project_id) {
    return await WhitelistModel.query().
      where('project_id', project_id).getCount();
  }

  async checkExisted(wallet_address, project_id) {
    const wl = await WhitelistModel.query().
      where('project_id', project_id).
      where('wallet_address', wallet_address).first();
    return wl != null ? true : false;
  }

  async search(params) {
    let builder = this.buildSearchQuery(params);
    if (params.page && params.pageSize) {
      // pagination
      return await builder.paginate(params.page, params.pageSize);
    }
    // return all result
    return await builder.fetch();
  }

  async addWhitelistUser(params) {
    console.log('[addWhitelistUser] - Params: ', params);
    const whitelist = new WhitelistModel;
    whitelist.wallet_address = params.wallet_address;
    whitelist.project_id = params.project_id;
    await whitelist.save();

    console.log('Res: ', whitelist);
    return whitelist;
  }

  async addWhitelistUserCsv(csv_path, project_id){
    const data = fs.readFileSync(csv_path)
    .toString() // convert Buffer to string
    .split('\n') // split string to lines
    .map(e => e.trim()) // remove white spaces for each line
    .map(e => e.split(',').map(e => e.trim())); // split each line to array

    // Get wallet alredy have project
    const wallet_exits = await Database.select('wallet_address')
    .from('whitelist_users')
    .where('project_id', project_id)
    .whereIn('wallet_address', data);

    const whiteList_wallet = [];

    for (let i = 0; i < data.length; i++){
      let wallet = data[i][0]
      if (!(wallet.length === 0)){
        let users = {
          wallet_address: wallet,
          project_id: project_id,
        }
        whiteList_wallet.push(users);
      }
    }

    //Filter whitelist wallet not alredy have project
    const whiteList = whiteList_wallet.filter((e) => !wallet_exits.find(({ wallet_address }) => e.wallet_address === wallet_address))

    var whiteListUsers = [];
    if (!(whiteList.length === 0)){
      whiteListUsers = await WhitelistModel.createMany(whiteList);
      console.log('Whitelist Users: ', whiteListUsers);
    }
    return whiteListUsers;
  }
}

module.exports = WhitelistUserService
