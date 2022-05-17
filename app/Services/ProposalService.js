'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalModel = use('App/Models/Proposal');
const Const = use('App/Common/Const');
const Database = use('Database')
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
        .filter(e => !(e === Const.PROPOSAL_STATUS.CREATED && params.is_public));
      builder = builder.whereRaw(filter.map(() => 'proposal_status=?').join(' or '), filter)
    }
    builder = builder.orderBy("id", 'desc')

    return builder;
  }
  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('wallet_address', 'like', `%${searchQuery}%`)
        .orWhere('name', 'like', `%${searchQuery}%`)
        .orWhere('description', 'like', `%${searchQuery}%`)
    })
  }

  async findOne(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }
  async findMany(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.fetch().then(res => res.rows)
  }
  async calcVoteResult(id) {
    // TODO: calc vote result after user vote.
    try {
      const proposal = await this.findOne({ id })

      if (!proposal) throw new Error()

      const subQueries = await Promise.all([
        Database
          .from('votes')
          .where('vote', true)
          .where('proposal_id', id)
          .where('status', true)
          .getSum('balance')
        ,
        Database
          .from('votes')
          .where('vote', false)
          .where('proposal_id', id)
          .where('status', true)
          .getSum('balance'),
        Database.from('votes').where('vote', true).andWhere('proposal_id', id).andWhere('status', true).getCount(),
        Database.from('votes').where('vote', false).andWhere('proposal_id', id).andWhere('status', true).getCount()
      ])
      // anwfi vote balance
      const up_vote_anwfi = subQueries[0] ?? 0
      const down_vote_anwfi = subQueries[1] ?? 0

      // vote count;
      const up_vote = subQueries[2] ?? 0
      const down_vote = subQueries[3] ?? 0
      proposal.merge({ up_vote, down_vote, up_vote_anwfi, down_vote_anwfi });
      await proposal.save();
    } catch (e) {
      console.log(e.message);
      return;
    }
  }
}

module.exports = ProposalService