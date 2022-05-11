'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalModel = use('App/Models/Proposal');
const Const = use('App/Common/Const');

class ProposalService {

  buildQueryBuilder(params) {
    let builder = ProposalModel.query();
    if (params.id) {
      builder = builder.where('id', params.id);
    }

    if (params.wallet_address) {
      builder = builder.where('wallet_address', params.wallet_address);
    }
    if (params.proposal_type) {
      builder = builder.where('proposal_type', params.proposal_type);
    }
    if (params.is_public) {
      builder = builder.where('proposal_status', '!=', Const.PROPOSAL_STATUS.CREATED);
    }
    if (params.count_vote) {
      builder.withCount('votes as up_vote', (builder) => {
        builder.where('vote', true)
      })
      builder.withCount('votes as down_vote', (builder) => {
        builder.where('vote', false)
      })
    }
    if (params.status) {
      const filter = params.status.split(',')
      .filter(el => el !== '')
      .map(e => parseInt(e))
      .filter(e => !(e === Const.PROPOSAL_STATUS.CREATED && !params.is_public));
      builder = builder.whereRaw(filter.map(() => 'proposal_status=?').join(' or '), filter)
    }

    return builder;
  }
  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('wallet_address', 'like', `%${searchQuery}%`)
        .orWhere('proposal_type', 'like', `%${searchQuery}%`)
        .orWhere('name', 'like', `%${searchQuery}%`)
    })
  }

  async findOne(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }

}

module.exports = ProposalService