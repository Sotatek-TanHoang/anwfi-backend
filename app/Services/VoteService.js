'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const VoteModel = use('App/Models/Vote');
const Const = use('App/Common/Const');

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

        return builder;
    }

    static async findOne(params) {
        let builder = this.buildQueryBuilder(params);
        return await builder.first();
    }
    static async calcBalance({ proposal_id }) {
        try {
            const proposal=ProposalModel.query().where("id",proposal_id).first()
            if(!proposal) throw new Error("ERROR: proposal's is invalid!")
            let votes = await VoteModel.query().where('proposal_id', proposal_id).fetch();

            const contract = new web3.eth.Contract(abi, AWNFIAddress)

            votes.forEach(async vote => {
                const balance = await contract.methods
                .balanceOf('0x866a4760CEb7F82D35e4e6C75e315098f18E0c81')
                .call()
                vote.balance = balance
                vote.status = proposal.toJSON().min_anwfi <= result;
                await vote.save();
            })
            
        } catch (error) {

        }
    }

}

module.exports = VoteService