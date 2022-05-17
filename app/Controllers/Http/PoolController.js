'use strict'

const HelperUtils = use('App/Common/HelperUtils');
const Web3 = require('web3')

const Const = use('App/Common/Const');
const rpcURL = "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15";
const web3 = new Web3(rpcURL)
const VoteModel = use('App/Models/Vote');
const ProposalModel = use('App/Models/Proposal');

const ContractService = use('App/Services/ContractService')
const abi=  require("../../abi/pools.json");
const PoolsAddress="0xC472DD48E8ad269ae174892B523e246BF26287cE";

class ProposalController {

  async createOrUpdate({ request }) {
    try {
        const contract = new ContractService()
        const data = await contract.getPoolInfo()
        // console.log(data)

    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get pool info  fail !');
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