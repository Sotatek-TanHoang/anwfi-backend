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
 

  // async getPoolInfo({ request }) {
  //   try {
      
  //     return HelperUtils.responseSuccess({

  //     });
  //   } catch (e) {
  //     console.log(e.message);
  //     return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
  //   }
  // }
  
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