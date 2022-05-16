'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalModel = use('App/Models/Proposal');
const Const = use('App/Common/Const');
const Web3=require('web3')
const abi=require('../abi/awnfi.json')

const AWNFIAddress="0x79E79B3EF77A9cE708A5218ddbD793807b2c4C33"
const rpcURL = "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15";

const web3 = new Web3(rpcURL)
class ContractService {
    constructor(){
        this.contract = new web3.eth.Contract(abi, AWNFIAddress)
    }
    async balanceOf(address){
        return await this.contract.methods.balanceOf(address).call()
    }
  
}

module.exports = ContractService