'use strict'

const HelperUtils = use('App/Common/HelperUtils');

const Const = use('App/Common/Const');
const VoteModel = use('App/Models/Vote');
const ProposalModel = use('App/Models/Proposal');

const ContractService = use('App/Services/ContractService')
const PoolTokenService=use('App/Services/PoolTokenService')
class PoolTokenController {

  async fetchTokenPrice() {
    try {
        const tokenService = new PoolTokenService()
        await tokenService.fetchTokenPrice()
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get pool token  info  fail !');
    }
  }
 
  async getTokenInfoFromSC() {
    try {
        const tokenService = new PoolTokenService()
        await tokenService.getTokenInfoFromSC()
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get pool token  info  fail !');
    }
  }
 

  async getPoolTokneInfo({ request }) {
    try {
      
      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }
}

module.exports = PoolTokenController