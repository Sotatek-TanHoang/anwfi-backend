'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Web3 = require('web3')

const Const = use('App/Common/Const');

const VoteModel = use('App/Models/Vote')
const VoteService = use('App/Services/VoteService')


const rpcURL = "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15";
const web3 = new Web3(rpcURL)

const ProposalModel = use('App/Models/Proposal');

const abi=  require("../../abi/awnfi.json");
const AWNFIAddress="0x79E79B3EF77A9cE708A5218ddbD793807b2c4C33";

// const randomString = use('random-string');
class ProposalController {

  async create({ request, auth }) {
    const inputs = request.only(['wallet_address', 'vote', 'proposal_id']);
    inputs.wallet_address=auth.user.wallet_address;
    const contract = new web3.eth.Contract(abi, AWNFIAddress)

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
    await contract.methods.balanceOf(auth.user.wallet_address)
    .call()
    .then(function(result){
      userVote.balance=result
      userVote.status= proposal.toJSON().min_anwfi <= result
    })

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