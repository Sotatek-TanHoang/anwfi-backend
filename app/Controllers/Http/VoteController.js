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
    const contract = new web3.eth.Contract(abi, AWNFIAddress)
    const existVote= await VoteModel.query().where('wallet_address',inputs.wallet_address).where('proposal_id',inputs.proposal_id).first();
    if(existVote) {
      existVote.merge(inputs)
      await existVote.save();
      return HelperUtils.responseSuccess(existVote);
    }
    // if vote not exist
    const vote = new VoteModel();
    vote.fill(inputs);
    const proposal= await ProposalModel.query().where('id',inputs.proposal_id).first();
    if(!proposal)  return HelperUtils.responseBadRequest('Cannot find this proposal!');
    // get user vote balance
    await contract.methods.balanceOf('0x866a4760CEb7F82D35e4e6C75e315098f18E0c81')
    .call()
    .then(function(result){
      vote.balance=result
      vote.status= proposal.toJSON().min_anwfi <= result
    })

    await vote.save();
    return HelperUtils.responseSuccess(vote);
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