'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Web3 = require('web3')

const Const = use('App/Common/Const');
const rpcURL = Const.RPCURL;
const web3 = new Web3(rpcURL)

const ContractService = use('App/Services/ContractService')
const PoolService = use('App/Services/PoolService')

class PoolController {

  async createOrUpdate() {
    try {
        const contract = new ContractService()
        const data = await contract.getPoolInfoFromSC()
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get pool info  fail !');
    }
  }
  
  // async createOrUpdateTokenInfo() {
  //   try {
  //       const contract = new ContractService()
  //       const data = await contract.getTokenInfoFromSC()
  //   } catch (e) {
  //     console.log(e);
  //     return HelperUtils.responseErrorInternal('ERROR: get pool info  fail !');
  //   }
  // }
 

  async getPoolInfo({ request} ) {
    try {
      const params = request.only(['limit', 'page', 'is_lp_token','pool_index']);
      // const searchQuery = request.input('query');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      console.log(params);
      const poolService = new PoolService()
      const poolQuery =  poolService.buildQueryBuilder(params)
      const pool = await poolQuery.paginate(page, limit);

      return HelperUtils.responseSuccess(pool);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }
  
  async getPoolLiquidity({ request }) {
    try {
      const poolService = new PoolService()
      const data = await poolService.caculatorAllLiquidity()

      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }
}

module.exports = PoolController