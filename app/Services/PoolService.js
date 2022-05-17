'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalModel = use('App/Models/proposal');
const Const = use('App/Common/Const');

class ProposalService {

  buildQueryBuilder(params) {
    let builder = ProposalModel.query();
    if (params.id) {
      builder = builder.where('id', params.id);
    }
    // if (params.username) {
    //   builder = builder.where('username', params.username);
    // }
    // if (params.email) {
    //   builder = builder.where('email', params.email);
    // }
    // if (params.signature) {
    //   builder = builder.where('signature', params.signature);
    // }
    if (params.wallet_address) {
      builder = builder.where('wallet_address', params.wallet_address);
    }
    if (params.proposal_type) {
      builder = builder.where('proposal_type', params.proposal_type);
    }
    if (params.count_vote) {
      builder.withCount('votes as up_vote', (builder) => {
        builder.where('vote', true)
      })
      builder.withCount('votes as down_vote', (builder) => {
        builder.where('vote', false)
      })
    }
    // if (params.role) {
    //   builder = builder.where('role', params.role);
    // }
    // if (params.confirmation_token) {
    //   builder = builder.where('confirmation_token', params.confirmation_token);
    // }
    // if (params.status !== undefined) {
    //   builder = builder.where('status', params.status);
    // } else {
    //   builder = builder.where('status', Const.USER_STATUS.ACTIVE);
    // }

    // get number of projects that each admin created
    // builder.withCount('projects as projects_created');
    return builder;
  }

  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('wallet_address', 'like', `%${searchQuery}%`)
        .orWhere('proposal_type', 'like', `%${searchQuery}%`)
      // .orWhere('lastname', 'like', `%${searchQuery}%`)
      // .orWhere('firstname', 'like', `%${searchQuery}%`);
    })
  }

  async findOne(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }
  async findByProjectId(proposalId){
    return findOne({id:proposalId});
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