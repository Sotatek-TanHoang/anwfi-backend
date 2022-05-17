'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Web3 = require('web3')

const Const = use('App/Common/Const');
const rpcURL = "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15";
const web3 = new Web3(rpcURL)
const VoteModel = use('App/Models/Vote');
const ProposalModel = use('App/Models/Proposal');

const abi=  require("../../abi/pools.json");
const PoolsAddress="0xC472DD48E8ad269ae174892B523e246BF26287cE";

// const randomString = use('random-string');
class ProposalController {

  async create({ request }) {
    // const inputs = request.only(['wallet_address', 'vote', 'proposal_id']);
    // const contract = new web3.eth.Contract(abi, AWNFIAddress)
    // const isVoted= await VoteModel.query().where('wallet_address',inputs.wallet_address).where('proposal_id',inputs.proposal_id).first();
    // if(isVoted) return HelperUtils.responseBadRequest('your have already voted  this proposal!');
    // const vote = new VoteModel();
    // vote.fill(inputs);
    // const proposal= await ProposalModel.query().where('id',inputs.proposal_id).first();
    // if(!proposal)  return HelperUtils.responseBadRequest('Cannot find this proposal!');
    // await contract.methods.balanceOf('0x866a4760CEb7F82D35e4e6C75e315098f18E0c81')
    // .call()
    // .then(function(result){
    //   vote.balance=result
    //   vote.status= proposal.toJSON().min_anwfi <= result
    // })
    // await vote.save();
    try {
    

      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: vote proposal fail !');
    }
  }
 
  async getVote({ request }) {
    try {
      
      return HelperUtils.responseSuccess({

      });
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get proposal list fail !');
    }
  }
}

module.exports = ProposalController