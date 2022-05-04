'use strict'
const ProposalService = use('App/Services/ProposalService');
const ProposalModel = use('App/Models/Proposal');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
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
  async pushProposalProcess({ request }) {

    try {
      const id = request.params.id
      console.log('Update proposal status with params: ', inputs, id);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {

        switch (proposal.proposal_status) {
          case Const.PROPOSAL_STATUS.ACTIVE:
          case Const.PROPOSAL_STATUS.FAILED:
          case Const.PROPOSAL_STATUS.EXECUTED:
            return HelperUtils.responseBadRequest('ERROR: you are not allowed to perform this action!');
        }
        proposal.proposal_status++;
        proposal.save();
        return HelperUtils.responseSuccess({
          proposal_id: id,
          new_status:proposal.proposal_status
        });
      }

      return HelperUtils.responseBadRequest('ERROR: proposal not exist !');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: update proposal fail !');
    }
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

      proposal.vote_data = {
        up_vote: await proposal.votes().where('vote', '=', 1).limit(3).fetch(1),
        down_vote: await proposal.votes().where('vote', '=', 0).limit(3).fetch(1),
      }
      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get proposal detail fail !');
    }
  }
}

module.exports = ProposalController