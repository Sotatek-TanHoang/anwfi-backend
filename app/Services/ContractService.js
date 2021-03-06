'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const PoolModel = use('App/Models/Pools');
const TokenInfoModel = use('App/Models/PoolTokenInfo');
const PoolUserStake=use('App/Models/PoolUserStake');
const Const = use('App/Common/Const');
const Web3=require('web3')
const rpcURL = Const.RPCURL;
const { BigNumber } = require("bignumber.js");

const web3 = new Web3(rpcURL)
class ContractService {

  getContract(param){
        const abi= require(`../abi/${param}.json`)
        var address
        switch(param) {
            case 'pools':
              address = Const.CONTRACT_ADDRESS.POOL;           
              break;
            case 'awnfi':
              address = Const.CONTRACT_ADDRESS.AWNFI;
              break;
            default:
              // code block
        }        
        const contract = new web3.eth.Contract(abi, address)
        return contract
    }
    static async getLatestBlockNumber(){
      return web3.eth.getBlockNumber();
    }
    async balanceOf(address){
        
        const contract= this.getContract('awnfi')
        const target=Web3.utils.toChecksumAddress(address)
        
        // return await contract.methods.balanceOf(target).call()
        const rawBalance = await contract.methods.balanceOf(target).call()
        const decimals = await contract.methods.decimals().call()

        const divider = new BigNumber(10).pow(BigNumber(decimals))
        const withDecimals = new BigNumber(rawBalance).dividedBy(divider)
        return withDecimals.toString()
    }
    async getUserStakePoolInfoFromSC(page,limit,poolId){
      const contract= this.getContract('pools')
      const listUserStake= (await PoolUserStake.query().where('pool_id',poolId).fetch()).toJSON()
      await Promise.all(
        listUserStake.map(async (e)=> {
       const data=await contract.methods.userInfo(e.pool_id,e.wallet_address).call()
       console.log("pool id and data ",data,e.pool_id)
       const poolStakeData = await PoolUserStake.query().where('wallet_address',e.wallet_address).where('pool_id',e.pool_id).first();
       poolStakeData.amount=data.amount
       poolStakeData.reward=data.pendingReward
       await poolStakeData.save()
       })
      )

      return (await PoolUserStake.query().where('pool_id',poolId).paginate(page, limit)).toJSON()

     }
   async getTotalAllocPointFromSC(){
    const contract= this.getContract('pools')
    return await contract.methods.totalAllocPoint().call()
   }
   async getPoolInfoFromSC(){
    const contract= this.getContract('pools')
    const poolLength=await contract.methods.poolLength().call()
    console.log("------poolLength------------",poolLength)
    for ( let i=0 ; i< poolLength;i++){
     const poolData=await contract.methods.poolInfo(i).call()
     const pool = await PoolModel.query().where('stake_token',poolData.stakeToken).first();
     var status=1
     if(poolData.allocPoint==0) status=2

     if(pool){   
        pool.merge({
        "total_stake":poolData.totalStake,
        "alloc_point": poolData.allocPoint,
        "pool_index":i,
        "last_reward_block":poolData.lastRewardBlock,
        "acc_reward_per_share":poolData.accRewardPerShare,
        "reward_amount":poolData.rewardAmount,
        "status":status
      })
        await pool.save()
     }  
     else {
        const newPool  = await PoolModel.create({
            pool_index:i,
            stake_token: poolData.stakeToken,
            total_stake: poolData.totalStake,
            alloc_point: poolData.allocPoint,
            last_reward_block: poolData.lastRewardBlock,
            acc_reward_per_share: poolData.accRewardPerShare,
            bonus_end_block: poolData.bonusEndBlock,
            start_block: poolData.startBlock,
            min_stake_period: poolData.minStakePeriod,
            bonus_multiplier: poolData.bonusMultiplier,
            reward_amount: poolData.rewardAmount,
            is_lp_token: poolData.isLpToken,
            status:status        
        })    
     }
    const tokenInfo = await TokenInfoModel.query().where('token_address',poolData.stakeToken).first();
    if(!tokenInfo){
        await TokenInfoModel.create({
            token_address: poolData.stakeToken,
            is_lp_token: poolData.isLpToken          
        })    
    }
    }
   }
   
}

module.exports = ContractService