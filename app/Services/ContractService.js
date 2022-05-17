'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalModel = use('App/Models/Proposal');
const Const = use('App/Common/Const');
const Web3=require('web3')
const AWNFIabi=require('../abi/awnfi.json')
const poolabi=require("../abi/pools.json");

// const AWNFIAddress="0x79E79B3EF77A9cE708A5218ddbD793807b2c4C33"
// const poolsAddress="0xC472DD48E8ad269ae174892B523e246BF26287cE";
 
const rpcURL = "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15";

const web3 = new Web3(rpcURL)
class ContractService {
    // constructor(){
    //     this.contract = new web3.eth.Contract(abi, AWNFIAddress)
    // }
    getContract(param){
        const abi= require(`../abi/${param}.json`)
        console.log(abi)
        // const data ={
        //     'pool':"0xC472DD48E8ad269ae174892B523e246BF26287cE",
        //     'awnfi':"0x79E79B3EF77A9cE708A5218ddbD793807b2c4C33"
        // }
        const data = {
            ['pool']: "0xC472DD48E8ad269ae174892B523e246BF26287cE",
            // [Const.NETWORK_AVAILABLE.BSC]: web3BscDev,
            // [Const.NETWORK_AVAILABLE.POLYGON]: web3PolygonDev
        }
        //  new networkToWeb3Dev['pool']
        const address = data['pool'];
        const contract = new web3.eth.Contract(abi, address)
        return contract
    }
    async balanceOf(address){
        const contract= this.getContract('awnfi')
        const target=Web3.utils.toChecksumAddress(address)
        return await contract.methods.balanceOf(target).call()
    }
   async getPoolInfo(){
    const contract= this.getContract('pools')
    console.log("dddddddddd",contract)
    //    const poolContract =new web3.eth.Contract(poolabi, poolsAddress)
    const poolLength=await contract.methods.poolLength().call()
    for ( let i=0 ; i< poolLength;i++){
     const poolData=await contract.methods.poolInfo(i).call()
     console.log(poolData)
    }
    // console.log(poolLength)
    // return poolLength

   }
}

module.exports = ContractService