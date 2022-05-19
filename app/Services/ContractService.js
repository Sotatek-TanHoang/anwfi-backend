'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const PoolModel = use('App/Models/Pools');
const TokenInfoModel = use('App/Models/PoolTokenInfo');
const Const = use('App/Common/Const');
const Web3=require('web3')
const rpcURL = Const.RPCURL;

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

    async balanceOf(address){
        
        const contract= this.getContract('awnfi')
        const target=Web3.utils.toChecksumAddress(address)
        
        // return await contract.methods.balanceOf(target).call()
        const rawBalance = await contract.methods.balanceOf(target).call()
        const decimals = await contract.methods.decimals().call()

        const divider = new BigNumber(10).pow(BigNumber(decimals))
        const withDecimals = new BigNumber(rawBalance).dividedBy(divider)
        return withDecimals
    }

   async getPoolInfoFromSC(){
    const contract= this.getContract('pools')
    const poolLength=await contract.methods.poolLength().call()
    console.log("dddddddddd",poolLength)

    for ( let i=0 ; i< poolLength;i++){
     const poolData=await contract.methods.poolInfo(i).call()
     const pool = await PoolModel.query().where('pool_index',i).first();
     if(pool){   
        pool.merge({"total_stake":poolData.totalStake,"alloc_point": poolData.allocPoint})
        await pool.save()
     }  
     else {
        const pool  = await PoolModel.create({
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
            is_lp_token: poolData.isLpToken          
        })    
     }
    const tokenInfo = await TokenInfoModel.query().where('token_address',poolData.stakeToken).first();
    if(!tokenInfo){
        const token  = await TokenInfoModel.create({
            token_address: poolData.stakeToken,
            is_lp_token: poolData.isLpToken          
        })    
    }
    }
   }
   
   async getTokenInfoFromSC(){
    const tokenInfo= await TokenInfoModel.query().fetch();
    if(!tokenInfo) return HelperUtils.responseSuccess({ });
    //  console.log(tokenInfo.toJSON())
     const listToken=tokenInfo.toJSON()

    for ( let i=0 ; i< listToken.length;i++){
        var token=listToken[i]
        if(!token.is_lp_token){
        const abi= require(`../abi/erc20Token.json`)
        const contract = new web3.eth.Contract(abi, token.token_address)
        // console.log(contract)
        await Promise.all( 
            [ contract.methods.decimals().call(),
              contract.methods.name().call(),
              contract.methods.symbol().call(),
              contract.methods.totalSupply().call(),
            //   contract.methods.token0().call(),
            //   contract.methods.token1().call(),
           ]
        ).then((values) => {
            console.log(values)
            token.decimals=values[0]
            token.name=values[1]
            token.symbol=values[2]
            token.total_supply=values[3]
        });
        // token.decimal = await contract.methods.decimals().call()
        // token.name =await contract.methods.name().call()
        // token.symbol =await contract.methods.symbol().call()
        // token.totalSupply =await contract.methods.totalSupply().call()
        }else {
        const abi= require(`../abi/lpToken.json`)
        const contract = new web3.eth.Contract(abi, token.token_address)
        // console.log(contract)
        await Promise.all( 
        [ contract.methods.getReserves().call(),
          contract.methods.kLast().call(),
          contract.methods.price0CumulativeLast().call(),
          contract.methods.price1CumulativeLast().call(),
          contract.methods.token0().call(),
          contract.methods.token1().call(),
          contract.methods.DOMAIN_SEPARATOR().call(),
          contract.methods.MINIMUM_LIQUIDITY().call(),
          contract.methods.PERMIT_TYPEHASH().call(),
          contract.methods.decimals().call(),
          contract.methods.factory().call(),
          contract.methods.name().call(),
          contract.methods.symbol().call(),
          contract.methods.totalSupply().call(),
        ]
       ).then((values) => {
        // token.getReserves=values[0]
        token.kLast=values[1]
        token.price0_cumulative_last=values[2]
        token.price1_cumulative_last=values[3]
        token.token0=values[4]
        token.token1=values[5]
        token.domain_separator = values[6]
        token.minimum_liquidity = values[7]
        token.permit_typehash = values[8]
        token.decimals = values[9]
        token.factory=values[10]
        token.name=values[11]
        token.symbol=values[12]
        token.total_supply=values[13]
        });        
        }
    console.log(token)
    const tokenNew=  await TokenInfoModel.query().where('token_address',token.token_address).first()
    tokenNew.merge(token)
    await tokenNew.save()
    }
   }

}

module.exports = ContractService