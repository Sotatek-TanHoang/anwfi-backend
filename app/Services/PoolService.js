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
    if (params.pool_index) {
      builder = builder.where('pool_index', params.pool_index);
    }
    // if (params.username) {
    //   builder = builder.where('username', params.username);
    // }
    // if (params.email) {
    //   builder = builder.where('email', params.email);
    // }
    // if (params.signature) {
    //   builder = builder.where('signature', params.signature);
    // }
    if (params.is_lp_token) {
      builder = builder.where('is_lp_token', params.is_lp_token);
    }

    // get number of projects that each admin created
    // builder.withCount('projects as projects_created');
    return builder;
  }

  async findOne(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }
  async findMany(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.fetch().then(res => res.rows)
  }

  async caculatorLiquidity(pool){
  const tokenInfo= (await TokenInfoModel.query().where('token_address',pool.stake_token).first()).toJSON();

  if(pool.is_lp_token===0 && tokenInfo.is_lp_token===0){
      console.log("its normal token",pool.id)
      const tokenInfo= (await TokenInfoModel.query().where('token_address',pool.stake_token).first()).toJSON();
      if(!tokenInfo.price|| !tokenInfo.decimals){
        console.log("no data!")
        pool.liquidity =null
      }else {
        const tokenAmount=Number(pool.total_stake)/Math.pow(10,Number(tokenInfo.decimals))
        // console.log("tokenAmountnnnnnnnnnnnnnn",tokenAmount)
        pool.liquidity=  Number(tokenInfo.price)*tokenAmount
      // console.log("caculator -------------",pool.liquidity)
    }
  }
  else if(pool.is_lp_token===1 && tokenInfo.is_lp_token){
    // console.log("its LP token",tokenInfo)
    if(!tokenInfo.decimals){
      console.log("no data!")
      pool.liquidity =null
    }else {
      const token0Info= (await TokenInfoModel.query().where('token_address',tokenInfo.token0).first()).toJSON();
      const token1Info= (await TokenInfoModel.query().where('token_address',tokenInfo.token1).first()).toJSON();
      // console.log("amount ",tokenInfo.amount_token0)

      // console.log(token0Info)
      // console.log(token1Info)

      const token0Amount=Number(tokenInfo.amount_token0)/Math.pow(10,Number(token0Info.decimals))
      const token1Amount=Number(tokenInfo.amount_token1)/Math.pow(10,Number(token1Info.decimals))

      // console.log("token0Amountnnnnnnnnnnnnnn",token0Amount)
      // console.log("token1Amountnnnnnnnnnnnnnn",token1Amount)

      pool.liquidity=  Number(token0Info.price)*token0Amount+Number(token1Info.price)*token1Amount
      // console.log("caculator -------------",pool.liquidity)
  }
 }
 else{
   console.log("error test data",pool.is_lp_token, tokenInfo.is_lp_token,pool.id)
 }
 const newPool = await PoolModel.query().where("id",pool.id).first()
 newPool.liquidity = pool.liquidity
 await newPool.save()

 }

  async caculatorAllLiquidity(){
    const listPool =(await PoolModel.query().fetch()).toJSON()
    for (let i=0; i<listPool.length; i++){
      await this.caculatorLiquidity(listPool[i])
    }
  }

  async findByProjectId(poolId){
    return findOne({id:poolId});
  }

}

module.exports = PoolService