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
    if(params.is_public){
      builder = builder.where('proposal_status', '!=',Const.PROPOSAL_STATUS.CREATED);
    }
    if (params.count_vote) {
      builder.withCount('votes as up_vote', (builder) => {
        builder.where('vote', true)
      })
      builder.withCount('votes as down_vote', (builder) => {
        builder.where('vote', false)
      })
    }
    if(params.status){
      builder = builder.where('proposal_status',params.status);
    }
    
    return builder;
  }
  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('wallet_address', 'like', `%${searchQuery}%`)
        .orWhere('proposal_type', 'like', `%${searchQuery}%`)
    })
  }

  async findOne(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }
  // async findOneWithVotes(params) {
  //   console.time('a')
  //   const posts = await ProposalModel
  //     .query()
  //     .withCount('votes as yes_count', (builder) => {
  //       builder.where('vote', true)
  //     }).withCount('votes as no_count', (builder) => {
  //       builder.where('vote', false)
  //     })
  //     .first()
  //   return posts
  // }

}

module.exports = ProposalService