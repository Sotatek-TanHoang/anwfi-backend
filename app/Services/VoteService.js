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

}

module.exports = VoteService