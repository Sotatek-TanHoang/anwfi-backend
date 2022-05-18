'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const VoteModel = use('App/Models/Vote');
const Const = use('App/Common/Const');
const HelperUtils = use('App/Common/HelperUtils')
const ContractService = require('./ContractService')
const Database = use('Database')
const ProposalModel=use('App/Models/Proposal')
class VoteService {

    static buildQueryBuilder(params) {
        let builder = VoteModel.query();
        if (params.id) {
            builder = builder.where('id', params.id);
        }
        if (params.wallet_address) {
            builder = builder.where('wallet_address', params.wallet_address);
        }
        if (params.proposal_id) {
            builder = builder.where('proposal_id', params.proposal_id);
        }
        if(params.status){
            builder = builder.where('status', params.status);
        }
        builder = builder.orderBy("id", 'desc')
        return builder;
    }

    static async findOne(params) {
        let builder = this.buildQueryBuilder(params);
        return await builder.first();
    }
    static async findMany(params){
        let builder = this.buildQueryBuilder(params);
        return await builder.fetch().then(res=>res.rows);
    }
    async calcBalance(proposal_id) {

        const trx = await Database.beginTransaction()

        try {
            const proposal =await ProposalModel.query().where("id", proposal_id).first()
            if (!proposal) throw new Error("ERROR: proposal is invalid!")
            const contractService = new ContractService()
            let totalVotes = await VoteModel.query().where('proposal_id', proposal_id).fetch().then(res=>res.rows);
    
            for (const vote of totalVotes) {
                const balance = await contractService.balanceOf(vote.wallet_address);
                vote.balance = balance;
                vote.status = HelperUtils.compareBigNumber(balance, proposal.toJSON().min_anwfi);
                await vote.save(trx);
            }

            await trx.commit()
            return;

        } catch (error) {
            await trx.rollback()
            console.log(error.message);
            return;
        }
    }

}

module.exports = VoteService