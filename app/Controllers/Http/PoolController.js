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
      const inputs = request.only(['stake_token', 'name', 'alloc_point', 'start_block', 'bonus_multiplier', 'bonus_end_block','is_display', 'is_lp_token', 'min_stake_period']);
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
  async checkPoolToken({ request, auth, response }) {
    try {
      const inputs = request.only(['stake_token']);
      console.log('check pool with PoolToken: ', inputs);
      
      const pool = await (new PoolService()).findOne({ stake_token: inputs.stake_token });
      console.log(pool)
      if (pool) {
        return response.badRequest(HelperUtils.responseDuplical( { "error_type": "ALREADY_EXIST" },'ERROR: Already have pool with this stake token !'));
      }
      else return response.ok(HelperUtils.responseSuccess( " This pool stake token had not use in any pool!"));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR !'));
    }
  }

  async updatePool({ request, params, auth, response }) {
    try {
      const id = params.poolId
      const inputs = request.only(['stake_token', 'name', 'alloc_point', 'start_block', 'bonus_multiplier', 'bonus_end_block', 'is_display', 'is_lp_token', 'min_stake_period']);
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
      const latestBlockNumber = await ContractService.getLatestBlockNumber();


      const poolUpdate = await (new PoolService()).findOne({ id });
      // pool not exist
      if (!poolUpdate)
        return response.badRequest(HelperUtils.responseBadRequest(' cannot find this pool with id !'));
      // pool has been deployed, only update alloc_point
      if (poolUpdate.status === Const.POOL_STATUS.LIVE) {
        const { alloc_point, bonus_multiplier, start_block, min_stake_period ,is_display} = inputs;
        // startblock >= current
        if (HelperUtils.compareBigNumber(poolUpdate.start_block, latestBlockNumber)) {

          poolUpdate.merge({ alloc_point, bonus_multiplier, start_block, min_stake_period ,is_display});
        } else {
          // after deployed and start_block < current, only update alloc point
          poolUpdate.merge({ alloc_point: inputs.alloc_point ,is_display:inputs.is_display});
        }
        await poolUpdate.save();
        return response.ok(HelperUtils.responseSuccess( poolUpdate," This pool is deploy.Some field can not change.Success update pool!"));
      }
      // pool not deployed, update all
      else if (poolUpdate.status === Const.POOL_STATUS.CREATED) {
        poolUpdate.merge(inputs);
        await poolUpdate.save();
        return response.ok(HelperUtils.responseSuccess(poolUpdate,"This pool is not deploy.Success update!"));
      }
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: update pool fail !'));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: update pool fail !'));
    }
  }

  async createOrUpdate({response}) {
    try {
      const contract = new ContractService()
      const data = await contract.getPoolInfoFromSC()
    } catch (e) {
      console.log(e);
      return response.internalServerError(HelperUtils.responseErrorInternal('ERROR: get pool info  fail !'));
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


 async getPoolParticipant({request,response}){
  try {
    const params = request.only(['limit', 'page','poolId']);
    const limit = params.limit || Const.DEFAULT_LIMIT;
    const page = params.page || 1;
    const poolId=params.poolId
    const contract = new ContractService()
    
    const data = await contract.getUserStakePoolInfoFromSC(page,limit,poolId)
    return HelperUtils.responseSuccess(data);

    } catch (e) {
      console.log(e);
      return response.internalServerError( HelperUtils.responseErrorInternal('ERROR: get pool partycipant  fail !'));
    }

  }
  async getPoolInfo({ request, response}) {
    try {
      const params = request.only(['limit', 'page', 'is_lp_token', 'stake_token', 'status', 'name', 'is_display', 'is_lp_token','DESC_APR']);
      const searchQuery = request.input('query');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      params.with_token_info=true;
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
      return response.internalServerError(HelperUtils.responseErrorInternal('ERROR: get pools list fail !'));
    }
  }
  async getPoolDetail({ params ,response}) {
    try {
      const stakeToken = params.stake_token
      const poolService = new PoolService()
      const pool = await poolService.poolDetail(stakeToken)

      return HelperUtils.responseSuccess(pool);
    } catch (e) {
      console.log(e.message);
      return response.internalServerError(HelperUtils.responseErrorInternal('ERROR: get pool detail fail !'));
    }
  }

  async getPoolLiquidity({ request ,response}) {
    try {
      const poolService = new PoolService()
      const data = await poolService.caculatorAll()

      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e.message);
      return response.internalServerError(HelperUtils.responseErrorInternal('ERROR: get pool liquidity fail !'));
    }
  }
}

module.exports = PoolController