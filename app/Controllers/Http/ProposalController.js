'use strict'
const ProposalService = use('App/Services/ProposalService');
const ProposalModel = use('App/Models/Proposal');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
// const randomString = use('random-string');
class ProposalController {

  async createProposal({ request, auth }) {
    try {
      const inputs = request.only(['proposal_type', 'current_value', 'new_value', 'description', 'is_display', 'start_time', 'end_time', 'quorum', 'min_anwfi', 'pass_percentage']);
      console.log('Create proposal with params: ', inputs);

      const proposal = new ProposalModel();
      proposal.fill(inputs);

      proposal.is_deploy = 0;
      proposal.proposal_status = Const.PROPOSAL_STATUS.CREATED;
      proposal.wallet_address = auth.user.wallet_address;
      await proposal.save();

      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: create proposal fail !');
    }
  }
  async updateProposalBasic({ request }) {
    try {
      const id = request.params.id
      const inputs = request.only(['proposal_type', 'new_value', 'description', 'is_display', 'start_time', 'end_time', 'quorum', 'min_anwfi', 'pass_percentage']);
      console.log('Update proposal with params: ', inputs);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {
        // Cannot modify proposal after it is active.
        if (proposal.proposal_status !== Const.PROPOSAL_STATUS.CREATED) {
          return HelperUtils.responseBadRequest('ERROR: you cannot modify the proposal right now!');
        }
        proposal.merge(inputs);
        proposal.save();
        return HelperUtils.responseSuccess(proposal);
      }

      return HelperUtils.responseBadRequest('ERROR: proposal not exist !');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: update proposal fail !');
    }
  }
  async updateProposalStatus({ request }) {

    try {
      const id = request.params.id
      const { new_status } = request.only(['new_status']);
      console.log('Update proposal status with params: ', inputs, id);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {
        // Cannot modify proposal after it is active.
        // if(proposal.proposal_status > Const.PROPOSAL_STATUS.CREATED){
        //   return HelperUtils.responseBadRequest('ERROR: you cannot modify the proposal right now!');
        // }
        proposal.proposal_status = new_status;
        proposal.save();
        return HelperUtils.responseSuccess({
          proposal_id: id,
          new_status
        });
      }

      return HelperUtils.responseBadRequest('ERROR: proposal not exist !');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: update proposal fail !');
    }
    // return HelperUtils.responseSuccess({
    //   "status": 200,
    //   "message": "Success !",
    //   "data": {
    //     "proposal_type": "swap fee",
    //     "current_value": "0.23",
    //     "new_value": "0.24",
    //     "description": "mock updateProposal status",
    //     "is_display": true,
    //     "start_time": "Mon, 18 Apr 2022 10:33:43 GMT",
    //     "end_time": "Mon, 18 Apr 2022 10:33:43 GMT",
    //     "quorum": "1000000000",
    //     "min_anwfi": "1000000000",
    //     "pass_percentage": 1,
    //     "is_deploy": 0,
    //     "proposal_status": input.new_status,
    //     "wallet_address": "0x9f1F81479c696E358D790d0a848B41e0DED698e0",
    //     "created_at": "2022-04-27 10:58:38",
    //     "updated_at": "2022-04-27 10:58:38",
    //     "id": inputs.id
    //   }
    // });
  }
  async deleteProposal() {
    try {
      const id = request.params.id
      console.log('Delete proposal with id: ', id);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {
        // Cannot modify proposal after it is active.
        if (proposal.proposal_status !== Const.PROPOSAL_STATUS.CREATED) {
          return HelperUtils.responseBadRequest('ERROR: you cannot modify the proposal right now!');
        }
        proposal.delete();
        proposal.save();
        return HelperUtils.responseSuccess(proposal);
      }

      return HelperUtils.responseBadRequest('ERROR: proposal not exist !');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: delete proposal fail !');
    }
    // return HelperUtils.responseSuccess({
    //   status:200,
    //   message:'Success',
    //   data:{
    //     "proposal_type": "swap fee",
    //     "current_value": "0.23",
    //     "new_value": "0.24",
    //     "description": "mock updateProposal status",
    //     "is_display": true,
    //     "start_time": "Mon, 18 Apr 2022 10:33:43 GMT",
    //     "end_time": "Mon, 18 Apr 2022 10:33:43 GMT",
    //     "quorum": "1000000000",
    //     "min_anwfi": "1000000000",
    //     "pass_percentage": 1,
    //     "is_deploy": 0,
    //     "proposal_status": 0,
    //     "wallet_address": "0x9f1F81479c696E358D790d0a848B41e0DED698e0",
    //     "created_at": "2022-04-27 10:58:38",
    //     "updated_at": "2022-04-27 10:58:38",
    //     "id": 1

    //   }
    // });
  }
  async getProposalList({ request }) {
    try {
      console.log('here');
      const params = request.only(['limit', 'page']);
      const searchQuery = request.input('searchQuery');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      params.count_vote = true

      const proposalService = new ProposalService();
      let proposalQuery = proposalService.buildQueryBuilder(params);
      if (searchQuery) {
        proposalQuery = proposalService.buildSearchQuery(proposalQuery, searchQuery);
      }
      const proposal = await proposalQuery.paginate(page, limit);
      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }

  async getProposalDetail({ request, params }) {
    try {
      const id = params.id;
      const proposalService = new ProposalService();
      const proposal = await proposalService.findOne({ id, count_vote: true });

      if (proposal.proposal_status > Const.PROPOSAL_STATUS.CREATED) {

        proposal.vote_data = {
          up_vote: await proposal.votes().where('vote', '=', 1).limit(3).fetch(1),
          down_vote: await proposal.votes().where('vote', '=', 0).limit(3).fetch(1),
        }
      } else {
        proposal.vote_data = {
          up_vote: [],
          down_vote: [],
        }
      }
      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get proposal detail fail !');
    }
  }
}

module.exports = ProposalController