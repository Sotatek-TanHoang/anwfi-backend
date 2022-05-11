'use strict'
const ProposalService = use('App/Services/ProposalService');
const ProposalModel = use('App/Models/Proposal');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Database = use('Database')
class ProposalController {

  async createProposal({ request, auth }) {
    try {
      const inputs = request.only(['proposal_type', 'current_value', 'new_value', 'description', 'start_time', 'end_time', 'quorum', 'min_anwfi', 'pass_percentage']);
      console.log('Create proposal with params: ', inputs);

      const proposal = new ProposalModel();
      proposal.fill(inputs);
      proposal.tmp_created = ProposalModel.formatDates('tmp_created', new Date().toISOString());
      proposal.is_deploy = 0;
      proposal.is_display= 0;
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
      const inputs = request.only(['proposal_type', 'new_value', 'description', 'start_time', 'end_time', 'quorum', 'min_anwfi', 'pass_percentage']);
      console.log('Update proposal with params: ', inputs);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {
        // Cannot modify proposal after it is active.
        if (proposal.proposal_status !== Const.PROPOSAL_STATUS.CREATED) {
          return HelperUtils.responseBadRequest('ERROR: you cannot modify the proposal right now!');
        }
        proposal.tmp_created = ProposalModel.formatDates('tmp_created', new Date().toISOString());
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
      console.log('Update proposal status with params: ', id);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {

        switch (parseInt(proposal.proposal_status)) {
          case Const.PROPOSAL_STATUS.ACTIVE:
          case Const.PROPOSAL_STATUS.FAILED:
          case Const.PROPOSAL_STATUS.EXECUTED:
            return HelperUtils.responseBadRequest('ERROR: you are not allowed to perform this action!');
        }


        proposal.proposal_status = parseInt(proposal.proposal_status) + 1;
        
        if (parseInt(proposal.proposal_status) === Const.PROPOSAL_STATUS.ACTIVE) {
          proposal.tmp_active = ProposalModel.formatDates('tmp_active', new Date().toISOString());
        }
        if (parseInt(proposal.proposal_status) === Const.PROPOSAL_STATUS.QUEUE) {
          proposal.tmp_queue = ProposalModel.formatDates('tmp_queue', new Date().toISOString());
        }
        if (parseInt(proposal.proposal_status) === Const.PROPOSAL_STATUS.EXECUTED) {
          proposal.tmp_executed = ProposalModel.formatDates('tmp_executed', new Date().toISOString());
        }

        proposal.save();
        return HelperUtils.responseSuccess({
          proposal_id: id,
          new_status: proposal.proposal_status
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
      const params = request.only(['limit', 'page']);
      const searchQuery = request.input('query');
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
      const proposal = await proposalService.findOne({ id, count_vote: true, count_anwfi: true });
      const subQueries = [
        proposal.votes().where('vote', '=', 1).limit(3).fetch(),
        proposal.votes().where('vote', '=', 0).limit(3).fetch(),
        Database.from('votes').where('vote', true).andWhere('proposal_id',id).getSum('balance'),
        Database.from('votes').where('vote', false).andWhere('proposal_id',id).getSum('balance')
      ]
      const results = await Promise.all(subQueries)

      proposal.vote_data = {
        up_vote: results[0] || [],
        down_vote: results[1] || [],
        up_vote_anwfi: results[2] || '0',
        down_vote_anwfi: results[3] || '0',
      }

      proposal.history = HelperUtils.getProposalHistory(proposal);
      return HelperUtils.responseSuccess(proposal.toJSON());
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get proposal detail fail !');
    }
  }
}

module.exports = ProposalController