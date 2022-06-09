'use strict'

const HelperUtils = use('App/Common/HelperUtils');

const Const = use('App/Common/Const');
const Database = use("Database")
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
    const trx = await Database.beginTransaction();
    try {
      const inputs = request.only(['logo_token1', 'logo_token2']);
      const id = request.params.id;
      console.log(inputs);
      const token = await TokenInforModel.query().where("id", id).first();
      if (!token) {
        return response.badRequest(HelperUtils.responseBadRequest("Error: update non-existing token."))
      }
      const { logo_token1 = null, logo_token2 = null } = inputs;
      // update global.
      // is normal token.

      if (!token.is_lp_token) {
        token.merge({ logo_token1 });
        await Promise.all([
          await trx.update({ logo_token1:logo_token1 }).into('pool_token_infos').where("token0", token.token_address),
          await trx.update({ logo_token2:logo_token1 }).into('pool_token_infos').where("token1", token.token_address)
        ])
      } else {
        // is lp_token.
        token.merge({ logo_token1, logo_token2 });
        // update normal token
        await Promise.all([
          trx.update({ logo_token1 }).into('pool_token_infos').where("token_address", token.token0),
          trx.update({ logo_token1:logo_token2 }).into('pool_token_infos').where("token_address", token.token1),
          // update other lp_tokens
          // logo1
          trx.update({ logo_token1 }).into('pool_token_infos').where("token0", token.token0),
          trx.update({ logo_token1 }).into('pool_token_infos').where("token0", token.token1),
          // logo2
          trx.update({ logo_token2 }).into('pool_token_infos').where("token1", token.token0),
          trx.update({ logo_token2 }).into('pool_token_infos').where("token1", token.token1),

        ])
      }

      await token.save(trx);
      await trx.commit();
      return HelperUtils.responseSuccess(token.toJSON());
    } catch (e) {
      console.log(e);
      await trx.rollback();
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
      const searchQuery = request.input('query');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      console.log(params);
      const poolTokenService = new PoolTokenService()
      const qb = poolTokenService.buildQueryBuilder(params)
      const poolTokenQuery = poolTokenService.buildSearchQuery(qb, searchQuery)
      const poolToken = await poolTokenQuery.paginate(page, limit);

      return HelperUtils.responseSuccess(poolToken);

    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get pool token list fail !');
    }
  }
}

module.exports = PoolTokenController