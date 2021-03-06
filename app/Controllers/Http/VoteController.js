'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const VoteModel = use('App/Models/Vote')
const VoteService = use('App/Services/VoteService')
const ContractService = use('App/Services/ContractService')
const ProposalModel = use('App/Models/Proposal');
const ProposalService = use('App/Services/ProposalService')
class ProposalController {

  async create({ request, auth, response }) {
    try {
      const inputs = request.only(['vote']);
      inputs.wallet_address = auth.user.wallet_address;
      inputs.proposal_id = request.params.id;

      const contract = new ContractService()
      const proposalService = new ProposalService()
      const proposal = await ProposalModel.query().where('id', inputs.proposal_id).first();
      if (!proposal)
        return response.badRequest(HelperUtils.responseBadRequest('ERROR: Cannot find this proposal!'));

      if (proposal.proposal_status !== Const.PROPOSAL_STATUS.ACTIVE) {
        return response.badRequest(HelperUtils.responseBadRequest('ERROR: Cannot vote for this proposal right now!'));
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
      userVote.timestamp=VoteModel.formatDates('timestamp', new Date().toISOString());
      userVote.balance = await contract.balanceOf(auth.user.wallet_address)
      userVote.status = HelperUtils.compareBigNumber(userVote.balance, proposal.toJSON().min_anwfi)
      await userVote.save();
      await proposalService.calcVoteResult(proposal.id).catch(e=>{
        console.log("PROPOSAL ERROR:",e.message);
      })
      return HelperUtils.responseSuccess(userVote);
    }
    catch (e) {
     // console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: vote proposal fail !'));
    }
  }

  async getVote({ request, response }) {
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
      return response.badRequest(HelperUtils.responseErrorInternal(`ERROR: get proposal's votes fail!`));
    }
  }
  async checkUserVote({request,auth}){
    try {
      const proposal_id = request.params.id;
      const wallet_address=auth.user.wallet_address;

      const vote=await VoteService.findOne({
        proposal_id,
        wallet_address
      })
      const result={
        is_voted:false,
        vote:null
      }
      if(vote?.id){
        result.vote=vote.toJSON();
        result.is_voted=true;
        return HelperUtils.responseSuccess(result);
      }
      return HelperUtils.responseSuccess(result);
    } catch (e) {
      console.log(e.message);
      return response.badRequest(HelperUtils.responseErrorInternal(`ERROR: get proposal's votes fail!`));
    }
  }
}

module.exports = ProposalController