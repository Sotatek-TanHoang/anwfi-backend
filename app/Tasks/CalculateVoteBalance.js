'use strict'

const Task = use('Task')
const VoteService = use('App/Services/VoteService')
const ProposalService = use('App/Services/ProposalService')
const Const = use('App/Common/Const')
class CalculateVoteBalance extends Task {
  static get schedule() {
    // return '0 0 */12 ? * *'
    return '0 */1 * * *'
    return '* * * * * '
  }

  async handle() {
    const voteService = new VoteService()
    const proposalService = new ProposalService()

    const activeProposals = await proposalService.findMany({ status: `${Const.PROPOSAL_STATUS.ACTIVE}` })
    for (const proposal of activeProposals) {
      console.log("Schedule: Calculate Vote Balance for proposal: ", proposal.id);
      await voteService.calcBalance(proposal.id)
      // if the hour is 0:0 then update the value
      const updateDelayedValue = parseInt(new Date().getHours()) === 0;
      
      await proposalService.calcVoteResult(proposal.id, updateDelayedValue);
      await proposalService.finishVoteResult(proposal.id)
    }
    return;
  }
}

module.exports = CalculateVoteBalance
