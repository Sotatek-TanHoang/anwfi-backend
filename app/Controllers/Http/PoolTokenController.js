'use strict'

const HelperUtils = use('App/Common/HelperUtils');

const Const = use('App/Common/Const');
// const VoteModel = use('App/Models/Vote');
// const ProposalModel = use('App/Models/Proposal');

// const ContractService = use('App/Services/ContractService')
const PoolTokenService = use('App/Services/PoolTokenService')
const TokenInforModel = use("App/Models/PoolTokenInfo")
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
  async updatePoolToken({ request, response }) {
    try {
      const inputs = request.only('logo_token1','logo_token2');
      const id = request.params.id;

      const token = await TokenInforModel.query().where("id", id).first();
      if (!token) {
        return response.badRequest(HelperUtils.responseBadRequest("Error: update non-existing token."))
      }
      token.merge(inputs);
      await token.save();
      return HelperUtils.responseSuccess(token.toJSON());
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseBadRequest("Error: update pool token failed"))
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


  async getPoolTokenInfo({ request }) {
    try {

      const params = request.only(['limit', 'page', 'is_lp_token', 'token_address', 'symbol']);
      // const searchQuery = request.input('query');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      console.log(params);
      const poolTokenService = new PoolTokenService()
      const poolTokenQuery = poolTokenService.buildQueryBuilder(params)
      const poolToken = await poolTokenQuery.paginate(page, limit);

      return HelperUtils.responseSuccess(poolToken);

    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }
}

module.exports = PoolTokenController