'use strict'

const StakingModel = use('App/Models/StakingPool');
const StakingLogModel = use('App/Models/StakingLog');
const AirDropModel = use('App/Models/AirDrops')
const WhitelistModel = use('App/Models/WhitelistUser');
const Const = use('App/Common/Const');
const HelperUtils = use('App/Common/HelperUtils');

class StakingService {

  buildQueryBuilder(params) {
    let builder = StakingModel.query();

    return builder;
  }

  async getStakeUsers(projectId) {
    let builder = StakingModel.query()
                  .select()
                  .where('project_id', projectId);

    return await builder.fetch();
  }

  async getWhitelistUse(projectId) {
    let result = await WhitelistModel.query()
              .select('wallet_address')
              .where('project_id', projectId)
              .fetch()
    result = JSON.parse(JSON.stringify(result));
    return result.map(e => {return e.wallet_address});
  }

  async countOtherStake(projectId, wallet = null, userWL) {
    let result =  await StakingLogModel.query()
        .select('wallet_address')
        .sum('stake_amount as total_amount')
        .where('project_id', projectId)
        .whereNotIn('wallet_address', userWL)
        .groupBy('wallet_address')
    let stake = {
      total_participant: result.length,
      total_stake: result.reduce((total, item) => total + item.total_amount, 0)
    }

    if(wallet) {
      let reward = await StakingModel.query()
      .select('allocation', 'wallet_address')
      .where('project_id', projectId)
      .where('wallet_address', wallet)
      .first()
      if(reward) {
        stake.allocation = reward.allocation
      }
    }

    return stake;
  }

  async countStake(projectId, buy_type) {
    if(buy_type === Const.BUY_TYPE.STAKE) {
      let result =  await StakingLogModel.query()
      .select('wallet_address')
      .sum('stake_amount as total_amount')
      .where('project_id', projectId)
      .groupBy('wallet_address')
    let stake = {
      total_participant: result.length,
      total_stake: result.reduce((total, item) => total + item.total_amount, 0)
    }

    return stake;
  } else {
    let result =  await AirDropModel.query()
    .select('wallet_address')
    .sum('amount as total_amount')
    .where('project_id', projectId)
    .groupBy('wallet_address')
    let stake = {
      total_participant: result.length,
      total_stake: result.reduce((total, item) => total + item.total_amount, 0)
    }

    return stake;
  }

}

  async countWlStake(projectId, wallet = null, userWL) {
    let result =  await StakingLogModel.query()
        .select('wallet_address')
        .sum('stake_amount as total_amount')
        .where('project_id', projectId)
        .whereIn('wallet_address', userWL)
        .groupBy('wallet_address')
    let stake = {
      total_participant: result.length,
      total_stake: result.reduce((total, item) => total + item.total_amount, 0)
    }

    if(wallet) {
      let reward = await StakingModel.query()
      .select('allocation', 'wallet_address')
      .where('project_id', projectId)
      .where('wallet_address', wallet)
      .first()

      if(reward) {
        stake.allocation = reward.allocation
      }
    }

    return stake;
  }

  async checkWalletJoinStake(projectId, wallet) {
    const checkWallet = await StakingModel.query().where({project_id: projectId, wallet_address: wallet}).first();
    let status_join = 0;
    let status_claim;
    if(checkWallet) {
      status_join = 1;
      status_claim = checkWallet.status;

    }
    let result = {
      status_join,
      status_claim
    }
    return result;
  }

  async updateStatusWalletJoinStake(projectId, wallet_address) {
    let wallet = await StakingModel.query().where({project_id: projectId, wallet_address: wallet_address, status: 0}).first();
    if (wallet){
      wallet.status = 1;
      wallet.save();
    }
    return wallet;
  }
}

module.exports = StakingService;
