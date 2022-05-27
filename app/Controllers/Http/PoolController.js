'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Web3 = require('web3')

const Const = use('App/Common/Const');
const rpcURL = Const.RPCURL;
const web3 = new Web3(rpcURL)

const PoolModel = use('App/Models/Pools');

const ContractService = use('App/Services/ContractService')
const PoolService = use('App/Services/PoolService')

class PoolController {

  async createPool({ request, auth, response }) {
    try {
      const inputs = request.only(['stake_token', 'name', 'alloc_point', 'start_block', 'bonus_multiplier', 'bonus_end_block', 'is_lp_token']);
      console.log('Create pool  with params: ', inputs);

      const pool = await (new PoolService()).findOne({ stake_token: inputs.stake_token });
      if (pool) {
        return response.badRequest(HelperUtils.responseErrorInternal('ERROR: Already have pool with this stake token !'));
      }
      const newPool = new PoolModel();
      newPool.fill(inputs);
      newPool.status = Const.POOL_STATUS.CREATED;

      await newPool.save();

      return response.ok(HelperUtils.responseSuccess(newPool));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: create pool fail !'));
    }
  }
  async updatePool({ request, params, auth, response }) {
    try {
      const id = params.poolId

      const inputs = request.only(['stake_token', 'name', 'alloc_point', 'start_block','bonus_multiplier','bonus_end_block','is_display','is_lp_token']);

      console.log(`Update pool ${id} with params: `, inputs);

      if (inputs.stake_token) {
        const pool = await (new PoolService()).findOne({
          stake_token: inputs.stake_token,
          except: id
        });
        if (pool) {
          return response.badRequest(HelperUtils.responseErrorInternal('ERROR: Already have pool with this stake token !'));
        }
      }

      const poolUpdate = await (new PoolService()).findOne({ id });

      if (poolUpdate) {
        // Cannot modify proposal after it is active.
        if (poolUpdate.status == Const.POOL_STATUS.CREATED) {
          poolUpdate.merge(inputs);
          await poolUpdate.save();
          return response.ok(HelperUtils.responseSuccess(poolUpdate));
        } else return response.badRequest(HelperUtils.responseBadRequest('ERROR: pool is deployed !'));
      } else return response.badRequest(HelperUtils.responseBadRequest(' cannot find this pool with id !'));

    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: update pool fail !'));
    }
  }

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


  async getPoolInfo({ request }) {
    try {

      const params = request.only(['limit', 'page', 'is_lp_token','stake_token','status','name','is_display','is_lp_token']);

      const searchQuery = request.input('query');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      console.log(params);
      const poolService = new PoolService()
      let poolQuery = poolService.buildQueryBuilder(params)
      if (searchQuery) {
        poolQuery = poolService.buildSearchQuery(poolQuery, searchQuery);
      }
      const pool = await poolQuery.paginate(page, limit);

      return HelperUtils.responseSuccess(pool);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get pools list fail !');
    }
  }
  async getPoolDetail({ params }) {
    try {
      const stakeToken = params.stake_token
      const poolService = new PoolService()
      const pool = await poolService.poolDetail(stakeToken)

      return HelperUtils.responseSuccess(pool);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get pool detail fail !');
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
      return HelperUtils.responseErrorInternal('ERROR: get pool liquidity fail !');
    }
  }
}

module.exports = PoolController