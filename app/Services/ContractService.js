'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalModel = use('App/Models/Proposal');
const Const = use('App/Common/Const');
const Web3 = require('web3')
const abi = require('../abi/awnfi.json')
const POOL_ABI = require('../abi/pool.json')
const { BigNumber } = require("bignumber.js");
const Env = use('Env')
const AWNFIAddress = "0x79E79B3EF77A9cE708A5218ddbD793807b2c4C33"
const POOL_ADDRESS = "0xC472DD48E8ad269ae174892B523e246BF26287cE"
const rpcURL = "https://rinkeby.infura.io/v3/9340d0c9c93046fb817055e8ba9d3c15";

const web3 = new Web3(rpcURL)
class ContractService {
    constructor() {
        this.anwfiContract = new web3.eth.Contract(abi, Env.get('ANWFI_ADDRESS', AWNFIAddress))
        this.poolContract = new web3.eth.Contract(POOL_ABI, Env.get('POOL_ADDRESS', POOL_ADDRESS));
    }
    async balanceOf(address) {
        const target = Web3.utils.toChecksumAddress(address)
        const rawBalance = await this.anwfiContract.methods.balanceOf(target).call()
        const decimals = await this.anwfiContract.methods.decimals().call()

        const divider = new BigNumber(10).pow(BigNumber(decimals))
        const withDecimals = new BigNumber(rawBalance).dividedBy(divider)

        return withDecimals.toString()
    }
    async getPoolInfor() {
       try{
        const poolLength = await contract.methods.poolLength().call()
        const pools = []
        for (let _pid = 0; i < poolLength; _pid++) {
            const pool = await this.poolContract.methods.poolInfo(_pid).call()
            pools.push(pool)
        }
        return pools;
       }catch(e){
           console.log(e.message);
           throw new Error("ERROR: get pools information fail.")
       }
    }


}

module.exports = ContractService