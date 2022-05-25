'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const PoolModel = use('App/Models/Pools');
const TokenInfoModel = use('App/Models/PoolTokenInfo');
const Const = use('App/Common/Const');
const axios = require('axios');
const Web3=require('web3');
const rpcURL = Const.RPCURL;
const web3 = new Web3(rpcURL)

class PoolTokenService {

  buildQueryBuilder(params) {
    let builder = TokenInfoModel.query();
    if (params.token_address) {
      builder = builder.where('token_address', params.token_address);
    }
    if (params.symbol) {
      builder = builder.where('symbol', params.symbol);
    }
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

  async getNormalTokenInfoFromSC(token){
    const abi= require(`../abi/erc20Token.json`)
    const contract = new web3.eth.Contract(abi, token.token_address)
    await Promise.all( 
        [ contract.methods.decimals().call(),
          contract.methods.name().call(),
          contract.methods.symbol().call(),
          contract.methods.totalSupply().call(),
        ]
    ).then((values) => {
        token.decimals=values[0]
        token.name=values[1]
        token.symbol=values[2]
        token.total_supply=values[3]
    });
    return token
  }

  async getLPTokenInfoFromSC(token){
    const abi= require(`../abi/lpToken.json`)
    const contract = new web3.eth.Contract(abi, token.token_address)
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
        token.amount_token0=values[0].reserve0
        token.token1=values[5]
        token.amount_token1=values[0].reserve1
        token.domain_separator = values[6]
        token.minimum_liquidity = values[7]
        token.permit_typehash = values[8]
        token.decimals = values[9]
        token.factory=values[10]
        token.name=values[11]
        token.symbol=values[12]
        token.total_supply=values[13]

    });
    return token
  }

  async getTokenInfoFromSC(){
   const tokenInfo= await TokenInfoModel.query().fetch();
   if(!tokenInfo) return HelperUtils.responseSuccess("update token info succces");
   const listToken=tokenInfo.toJSON()
   await Promise.all(
    listToken.map(async (token)=> {
      if(!token.is_lp_token){
        token= await this.getNormalTokenInfoFromSC(token)
      }
      else {
        token= await this.getLPTokenInfoFromSC(token)
        // check token 0 and token 1 info in DB.If dont have fetch it
        var token0=  await TokenInfoModel.query().where('token_address',token.token0).first()
        var token1=  await TokenInfoModel.query().where('token_address',token.token1).first()
        
        if(!token0){
          token0=await this.getNormalTokenInfoFromSC({'token_address':token.token0})
          token0.is_lp_token=0
          await TokenInfoModel.create(token0)            
          console.log("--------------create token 0-------------",token0)
        }

        if(!token1){
          token1=await this.getNormalTokenInfoFromSC({'token_address':token.token1})
          token1.is_lp_token=0
          await TokenInfoModel.create(token1)            
          console.log("--------------create token1-------------",token1)
        }    
      }
        const tokenNew=  await TokenInfoModel.query().where('token_address',token.token_address).first()
        tokenNew.merge(token)
        await tokenNew.save()
      })
      )
    }

    async fetchTokenPrice(){
    let response = null;
    const token =(await TokenInfoModel.query().where('is_lp_token',0).fetch()).toJSON()
    await Promise.all(token.map( async (token) => {
      const tokenNew =  await TokenInfoModel.query().where('token_address',token.token_address).first()
      await axios.get('https://pro-api.coinmarketcap.com/v2/tools/price-conversion', {
         headers: {
           'X-CMC_PRO_API_KEY': Const.COINMARKETCAP_API_KEY,
         },
         params: { amount: 1 ,symbol: token.symbol} ,
       })
       .then((response) => {
       console.log(response.data.data[0])
       var utcDate = response.data.data[0].last_updated;  // ISO-8601 formatted date returned from server
       var localDate = new Date(utcDate);
       tokenNew.merge({'price':response.data.data[0].quote.USD.price,'last_updated': localDate})
       tokenNew.save()
       })
       .catch((err) => {
        console.log(err)
       })

    }))
   }

}

module.exports = PoolTokenService