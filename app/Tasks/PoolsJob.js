'use strict'

const Task = use('Task')
// const VoteService = use('App/Services/VoteService')
// const ProposalService = use('App/Services/ProposalService')
const PoolService = use('App/Services/PoolService')
const ContractService = use('App/Services/ContractService')

const Const = use('App/Common/Const')
class FetchPoolInfo extends Task {
  static get schedule() {
    // return '0 0 */12 ? * *'
    // return '0 */1 * * *'  
    return '*/5 * * * *'
  }

  async handle() {
    const contract = new ContractService()
    const data = await contract.getPoolInfoFromSC()
    const poolService = new PoolService()
    await poolService.caculatorAllLiquidity()


    return;
  }
}

module.exports = FetchPoolInfo
