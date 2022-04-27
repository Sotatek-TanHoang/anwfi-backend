'use strict'
const proposalService = use('App/Services/ProposalService');
const ProposalModel = use('App/Models/proposal');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
// const randomString = use('random-string');
class ProposalController {

  async create({request, auth }) {
    try {
      const inputs = request.only(['proposal_type', 'current_valua', 'new_valua','description','is_display','start_time','end_time','quorun','min_anwfi','pass_percentage']);
      console.log('Create proposal with params: ', inputs);
      
      const proposal = new ProposalModel();
      proposal.fill(inputs);

      proposal.is_deploy = 0;
      proposal.status=Const.PROPOSAL_STATUS.CREATED;
      proposal.wallet_address=auth.user.wallet_address;
      await proposal.save();

      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: create proposal fail !');
    }
  }

  async proposalList({request}) {
    try {
      const params = request.only(['limit', 'page']);
      const searchQuery = request.input('searchQuery');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      
      const proposalService = new proposalService();
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

  // async adminDetail({request, params}) {
  //   try {
  //     const id = params.id;
  //     const adminService = new AdminService();
  //     const admins = await adminService.findUser({id});
  //     return HelperUtils.responseSuccess(admins);
  //   } catch (e) {
  //     console.log(e);
  //     return HelperUtils.responseErrorInternal('ERROR: get admin detail fail !');
  //   }
  // }
}

module.exports = ProposalController