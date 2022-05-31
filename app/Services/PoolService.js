'use strict'

const { baToJSON, TWO_POW256 } = require("ethereumjs-util");

const ErrorFactory = use('App/Common/ErrorFactory');
const Const = use('App/Common/Const');
const TokenInfoModel = use('App/Models/PoolTokenInfo');
const PoolModel = use('App/Models/Pools');
const { BigNumber } = require("bignumber.js");

class PoolService {

  buildQueryBuilder(params) {
    let builder = PoolModel.query();
    if (params.id) {
      builder = builder.where('id', params.id);
    }
    if(params.except){
      builder = builder.where('id','!=', params.except);
    }
    if (params.pool_index) {
      builder = builder.where('pool_index', params.pool_index);
    }
    if (params.stake_token) {
      builder = builder.where('stake_token', params.stake_token);
    }
    if (params.status) {
      const filter = params.status.split(',')
        .filter(el => el !== '')
        .map(e => parseInt(e))
        .filter(e => !(e === Const.PROPOSAL_STATUS.CREATED && params.is_public));
      builder = builder.whereRaw(`(${filter.map(() => 'status=?').join(' or ')})`, filter)
    }
    if (params.name) {
      builder = builder.where('name', params.name);
    }
    if (params.is_lp_token) {
      builder = builder.where('is_lp_token', params.is_lp_token);
    }
    if (params.is_display) {
      builder = builder.where('is_display', params.is_display);
    }

    // get number of projects that each admin created
    // builder.withCount('projects as projects_created');
    return builder;
  }
  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('name', 'like', `%${searchQuery}%`)
    })
  }

  async findOne(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }
  async poolDetail(stakeToken) {
    let pool= await PoolModel.query()
    .where('stake_token', stakeToken)
    .first();
    const token= await TokenInfoModel.query()
    .where('token_address',stakeToken)
    .first();
    pool.token=token
    return pool
    }


  async findMany(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.fetch().then(res => res.rows)
  }

  async caculatorLiquidity(pool){
  const data= await TokenInfoModel.query().where('token_address',pool.stake_token).first()
  const tokenInfo= data.toJSON();
  
  if(pool.is_lp_token===0 && tokenInfo.is_lp_token===0){
      console.log("its normal token",pool.id)
      if(!tokenInfo.price|| !tokenInfo.decimals){
        console.log("no data!")
        pool.liquidity =null
      }else {
        const tokenAmount=Number(pool.total_stake)/Math.pow(10,Number(tokenInfo.decimals))
        // console.log("tokenAmountnnnnnnnnnnnnnn",tokenAmount)
        pool.liquidity=  Number(tokenInfo.price)*tokenAmount
      // console.log("caculator -------------",pool.liquidity)
     }
    pool.name=tokenInfo.symbol
  }

  else if(pool.is_lp_token===1 && tokenInfo.is_lp_token){
    console.log("its LP token",pool.id)
    if(!tokenInfo.decimals){
      console.log("no data!")
      pool.liquidity =null
    }else {
      const token0Info= (await TokenInfoModel.query().where('token_address',tokenInfo.token0).first()).toJSON();
      const token1Info= (await TokenInfoModel.query().where('token_address',tokenInfo.token1).first()).toJSON();

      // console.log(token0Info)
      // console.log(token1Info)

      const token0Amount=Number(tokenInfo.amount_token0)/Math.pow(10,Number(token0Info.decimals))
      const token1Amount=Number(tokenInfo.amount_token1)/Math.pow(10,Number(token1Info.decimals))

      // console.log("token0Amountnnnnnnnnnnnnnn",token0Amount)
      // console.log("token1Amountnnnnnnnnnnnnnn",token1Amount)

      pool.liquidity=  Number(token0Info.price)*token0Amount+Number(token1Info.price)*token1Amount
      pool.name=token0Info.symbol+"/"+token1Info.symbol

      // console.log("caculator -------------",pool.liquidity)
  }
 }
 else{
   console.log("error data",pool.is_lp_token, tokenInfo.is_lp_token,pool.id)
 }
 const newPool = await PoolModel.query().where("id",pool.id).first()
 newPool.liquidity = pool.liquidity
 newPool.name=pool.name
 await newPool.save()

 }

  async caculatorAllLiquidity(){
    const listPool =(await PoolModel.query().whereNot("status",0).fetch()).toJSON()
    await Promise.all(listPool.map(async (pool)=> {await this.caculatorLiquidity(pool)}))
  }

  async findByProjectId(poolId){
    return findOne({id:poolId});
  }

}

module.exports = PoolService