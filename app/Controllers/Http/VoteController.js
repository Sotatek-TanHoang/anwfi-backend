'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const VoteModel = use('App/Models/Vote')
const VoteService = use('App/Services/VoteService')
const ContractService=use('App/Services/ContractService')
const ProposalModel = use('App/Models/Proposal');
class ProposalController {

  async create({ request, auth }) {
    const inputs = request.only(['wallet_address', 'vote', 'proposal_id']);
    inputs.wallet_address=auth.user.wallet_address;
    // const contract = new web3.eth.Contract(abi, AWNFIAddress)
    const contract=new ContractService()
    const proposal= await ProposalModel.query().where('id',inputs.proposal_id).first();
    if(!proposal) 
          return HelperUtils.responseBadRequest('Cannot find this proposal!');
    
    let userVote;
    // check if exist
    userVote= await VoteModel.query().where('wallet_address',auth.user.wallet_address).andWhere('proposal_id',inputs.proposal_id).first();
    if(userVote) {
      userVote.merge(inputs)
    }else{
      userVote = new VoteModel();
      userVote.fill(inputs);
    }
  
    // get user vote balance
    userVote.balance=await contract.balanceOf(auth.user.wallet_address)
    userVote.status= HelperUtils.compareBigNumber(userVote.balance, proposal.toJSON().min_anwfi)
  
    await userVote.save();
    return HelperUtils.responseSuccess(userVote);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: vote proposal fail !');
    }
  

  async getVote({ request }) {
    try {
      const params = request.only(['limit', 'page', 'status']);
      params.proposal_id=request.params.id;
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
  
      const voteQuery = VoteService.buildQueryBuilder(params);
      
      const proposal = await voteQuery.paginate(page, limit);
      return HelperUtils.responseSuccess(proposal);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal(`ERROR: get proposal's votes fail !`);
    }
}
}

module.exports = ProposalController