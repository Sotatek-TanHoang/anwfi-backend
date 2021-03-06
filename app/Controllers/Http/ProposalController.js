'use strict'
const ProposalService = use('App/Services/ProposalService');
const ProposalModel = use('App/Models/Proposal');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Database = use('Database')
class ProposalController {

  async createProposal({ request, auth, response }) {
    try {
      const inputs = request.only(['proposal_type', 'name', 'current_value', 'new_value', 'description', 'start_time', 'end_time', 'quorum', 'min_anwfi', 'pass_percentage']);
      console.log('Create proposal with params: ', inputs);

      const proposal = new ProposalModel();
      proposal.fill(inputs);
      proposal.tmp_created = ProposalModel.formatDates('tmp_created', new Date().toISOString());
      proposal.is_deploy = 0;
      proposal.is_display = 0;
      proposal.proposal_status = Const.PROPOSAL_STATUS.CREATED;
      proposal.wallet_address = auth.user.wallet_address;

      await proposal.save();

      return response.ok(HelperUtils.responseSuccess(proposal));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: create proposal fail !'));
    }
  }
  async finish({ request, auth }) {
    const inputs = request.only(['id','isTest']);

    try {
      const proposal = await (new ProposalService()).finishVoteResult(inputs.id,inputs.isTest);

      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR  !');
    }
  }

  async updateProposalBasic({ request, response }) {
    try {
      const id = request.params.id
      const inputs = request.only(['proposal_type', 'name', 'current_value', 'new_value', 'description', 'start_time', 'end_time', 'quorum', 'min_anwfi', 'pass_percentage']);

      console.log('Update proposal with params: ', inputs);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {
        // Cannot modify proposal after it is active.
        if (proposal.proposal_status !== Const.PROPOSAL_STATUS.CREATED) {
          return response.badRequest(HelperUtils.responseBadRequest('ERROR: you cannot modify the proposal right now!'));
        }
        proposal.tmp_created = ProposalModel.formatDates('tmp_created', new Date().toISOString());
        proposal.merge(inputs);

        await proposal.save();
        return response.ok(HelperUtils.responseSuccess(proposal));
      }

      return response.badRequest(HelperUtils.responseBadRequest('ERROR: proposal not exist !'));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: update proposal fail !'));
    }
  }
  async pushProposalProcess({ request, response }) {
    const trx = await Database.beginTransaction()
    try {
      const id = request.params.id
      console.log('Update proposal status with params: ', id);
      const proposalService = new ProposalService(trx);

      const proposal = await proposalService.findOne({ id });
      if (proposal) {

        switch (parseInt(proposal.proposal_status)) {
          case Const.PROPOSAL_STATUS.ACTIVE:
          case Const.PROPOSAL_STATUS.FAILED:
          case Const.PROPOSAL_STATUS.EXECUTED:
            return response.badRequest(HelperUtils.responseBadRequest('ERROR: you are not allowed to perform this action!'));
        }

        // TODO: except off-chain, 2 on-chain proposal with similar type cannot be active at the same time.
        if (proposal.proposal_type !== Const.PROPOSAL_TYPE.OFFCHAIN_PROPOSAL) {
          const otherActiveProposal = await proposalService
            .findOne({
              except: proposal.id,
              status:
                `${Const.PROPOSAL_STATUS.ACTIVE},
        ${Const.PROPOSAL_STATUS.SUCCESS},
        ${Const.PROPOSAL_STATUS.QUEUE},`
              , proposal_type: proposal.proposal_type,
            });

          if (otherActiveProposal) {
            await trx.rollback()
            return response.badRequest(HelperUtils.responseBadRequest('ERROR: only one on-chain proposal with this type is allowed to be active right now!'));
          }
        }
        // all requirements passed.
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

        await proposal.save(trx);
        await trx.commit()
        return response.ok(HelperUtils.responseSuccess({
          proposal_id: id,
          new_status: proposal.proposal_status
        }));
      }
      await trx.rollback()
      return response.badRequest(HelperUtils.responseBadRequest('ERROR: proposal not exist !'));
    } catch (e) {
      console.log(e);
      await trx.rollback();
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: update proposal fail !'));
    }
  }
  async deleteProposal({ request, response }) {
    try {
      const id = request.params.id
      console.log('Delete proposal with id: ', id);

      const proposal = await (new ProposalService()).findOne({ id });
      if (proposal) {
        // Cannot modify proposal after it is active.
        if (proposal.proposal_status !== Const.PROPOSAL_STATUS.CREATED) {
          return response.badRequest(HelperUtils.responseBadRequest('ERROR: you cannot modify the proposal right now!'));
        }
        await proposal.delete();
        return response.ok(HelperUtils.responseSuccess(proposal));
      }

      return response.badRequest(HelperUtils.responseBadRequest('ERROR: proposal not exist !'));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: delete proposal fail !'));
    }
  }
  async getProposalList({ request, auth, response }) {
    try {
      const params = request.only(['limit', 'page', 'status']);
      const searchQuery = request.input('query');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      // check if req is public
      if (!auth?.user || auth?.user?.role <= Const.USER_ROLE.PUBLIC_USER) {
        params.is_public = true
      }
      const proposalService = new ProposalService();
      let proposalQuery = proposalService.buildQueryBuilder(params);
      if (searchQuery) {
        proposalQuery = proposalService.buildSearchQuery(proposalQuery, searchQuery);
      }
      const proposal = await proposalQuery.paginate(page, limit);
      proposal.rows.forEach(r=>{
        r.__meta__={
          up_vote:HelperUtils.formatDecimal(r.d_up_vote),
          down_vote:HelperUtils.formatDecimal(r.d_down_vote),
          up_vote_anwfi:HelperUtils.formatDecimal(r.d_up_vote_anwfi),
          down_vote_anwfi:HelperUtils.formatDecimal(r.d_down_vote_anwfi)
        }
      })
      return response.ok(HelperUtils.responseSuccess(proposal));
    } catch (e) {
      console.log(e.message);
      return response.badRequest(HelperUtils.responseBadRequest('ERROR: Get proposals list fail!'));
    }
  }
  async getProposalDetail({ request, params, auth, response }) {
    try {
      const id = params.id;
      const proposalService = new ProposalService();
      // check if req is public
      const is_public = !auth.user || auth?.user?.role <= Const.USER_ROLE.PUBLIC_USER
      const proposal = await proposalService.findOne({ id, is_public });
      if (!proposal) throw new Error("ERROR: not found")
      const subQueries = [
        proposal.votes().where('vote', '=', 1).where('status', true).limit(3).fetch(),
        proposal.votes().where('vote', '=', 0).where('status', true).limit(3).fetch(),
        // Database.from('votes').where('vote', true).andWhere('proposal_id', id).getSum('balance'),
        // Database.from('votes').where('vote', false).andWhere('proposal_id', id).getSum('balance')
      ]
      const results = await Promise.all(subQueries)

      proposal.vote_data = {
        up_vote: results[0] || [],
        down_vote: results[1] || [],
        up_vote_anwfi: HelperUtils.formatDecimal(proposal.up_vote_anwfi),
        down_vote_anwfi: HelperUtils.formatDecimal(proposal.down_vote_anwfi),
      }
      proposal.__meta__ = {
        up_vote: HelperUtils.formatDecimal(proposal.up_vote),
        down_vote: HelperUtils.formatDecimal(proposal.down_vote)
      }
      proposal.history = HelperUtils.getProposalHistory(proposal);
      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseBadRequest('ERROR: get proposal detail fail !'));
    }
  }
}

module.exports = ProposalController