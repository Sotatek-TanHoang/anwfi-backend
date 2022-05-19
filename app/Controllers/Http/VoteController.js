'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const VoteModel = use('App/Models/Vote')
const VoteService = use('App/Services/VoteService')
const ContractService = use('App/Services/ContractService')
const ProposalModel = use('App/Models/Proposal');
const ProposalService = use('App/Services/ProposalService')
class ProposalController {

  async create({ request, auth }) {
    try {
      const inputs = request.only(['vote']);
      inputs.wallet_address = auth.user.wallet_address;
      inputs.proposal_id = request.params.id;

      const contract = new ContractService()
      const proposalService = new ProposalService()
      const proposal = await ProposalModel.query().where('id', inputs.proposal_id).first();
      if (!proposal)
        return HelperUtils.responseBadRequest('ERROR: Cannot find this proposal!');

      if (proposal.proposal_status !== Const.PROPOSAL_STATUS.ACTIVE) {
        return HelperUtils.responseBadRequest('ERROR: Cannot vote for this proposal right now!');
      }
      let userVote;
      // check if exist
      userVote = await VoteModel.query().where('wallet_address', auth.user.wallet_address).andWhere('proposal_id', inputs.proposal_id).first();
      if (userVote) {
        userVote.merge(inputs)
      } else {
        userVote = new VoteModel();
        userVote.fill(inputs);
      }

      // get user vote balance
      userVote.balance = await contract.balanceOf(auth.user.wallet_address)
      console.log(userVote.balance);
      userVote.status = HelperUtils.compareBigNumber(userVote.balance, proposal.toJSON().min_anwfi)
      await userVote.save();
      await proposalService.calcVoteResult(proposal.id)
      return HelperUtils.responseSuccess(userVote);
    }
    catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: vote proposal fail !');
    }
  }

  async getVote({ request }) {
    try {
      const params = request.only(['limit', 'page', 'status']);
      params.proposal_id = request.params.id;
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;

      const voteQuery = VoteService.buildQueryBuilder(params);

      const proposal = await voteQuery.paginate(page, limit);
      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal(`ERROR: get proposal's votes fail!`);
    }
  }
}

module.exports = ProposalController