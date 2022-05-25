'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const BaseService = use('App/Services/BaseService')
const ProposalModel = use('App/Models/Proposal');
const Const = use('App/Common/Const');
const Database = use('Database')
const HelperUtils = use('App/Common/HelperUtils')
const keccak256 = require('keccak256')

class ProposalService extends BaseService {

  buildQueryBuilder(params) {
    let builder = ProposalModel.query(this.trx);
    if (params.id) {
      builder = builder.where('id', params.id);
    }
    if (params.except) {

      builder = builder.where('id', '!=', params.except);

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
        builder.where('vote', true).andWhere('status', true)
      })
      builder.withCount('votes as down_vote', (builder) => {
        builder.where('vote', false).andWhere('status', true)
      })
    }
    if (params.status) {
      const filter = params.status.split(',')
        .filter(el => el !== '')
        .map(e => parseInt(e))
        .filter(e => !(e === Const.PROPOSAL_STATUS.CREATED && params.is_public));
      builder = builder.whereRaw(`(${filter.map(() => 'proposal_status=?').join(' or ')})`, filter)
    }
    if (params.end_time_after) {
      builder.where('end_time', '>=', params.end_time_after)
    }
    builder = builder.orderBy("id", 'desc')

    return builder;
  }
  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('name', 'like', `%${searchQuery}%`)
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
      console.log(proposal)
      proposal.merge({ up_vote, down_vote, up_vote_anwfi, down_vote_anwfi });
      await proposal.save();
      return proposal;
    } catch (e) {
      console.log(e.message);
      return;
    }
  }
  async finishVoteResult(id) {
    try {
      const proposal = await ProposalModel.query()
        .where("id", id)
        .where("proposal_status", 1)
        .first();
      if (!proposal) throw new Error("cannot find proposal or this proposal not active")
      var date = new Date(proposal.end_time);
      var finishTime = date.getTime();

      const now = new Date().getTime();
      // console.log("oooooooooooo", finishTime)
      // console.log("222222", finishTime + 60 * 60 * 1000 - now)

      // console.log(now)
      // check finish time is not 1 hour to now
      if (now < finishTime || finishTime + 60 * 60 * 1000 <= now) {
        return "It is not right time to check finish valua"
      }
      const passPercentage = HelperUtils.calcPercentage({
        up_vote: proposal.up_vote,
        down_vote: proposal.down_vote
      });

      const quorumPercentage = HelperUtils.calcPercentage({
        up_vote: proposal.up_vote_anwfi,
        down_vote: proposal.down_vote_anwfi
      })

      const isProposalPass =
        // up vote anwfi % >= proposal.quorum
        HelperUtils.compareBigNumber(quorumPercentage, proposal.quorum)
        &&
        // pass percentages is equal proposal.pass_percentage
        HelperUtils.compareBigNumber(passPercentage, proposal.pass_percentage);
      // determine proposal status
      if (isProposalPass) {
        proposal.proposal_status = Const.PROPOSAL_STATUS.SUCCESS;
      } else {
        proposal.proposal_status = Const.PROPOSAL_STATUS.FAILED;
      }
      // save timestamp of result;
      proposal.tmp_result = ProposalModel.formatDates('tmp_result', new Date().toISOString());

      const picked = (({ wallet_address,proposal_type,name,current_value,new_value ,description,start_time,end_time ,min_anwfi,quorum,pass_percentage,proposal_status}) =>
       ({ wallet_address,proposal_type,name,current_value,new_value ,description,start_time,end_time ,min_anwfi,quorum,pass_percentage,proposal_status}))
       (proposal);
      const data=JSON.stringify(picked) 
      const proposalHash=keccak256(Buffer.from(data)).toString('hex')
      console.log("hash----",proposalHash)

      proposal.proposal_hash=proposalHash
      // proposal.merge({ up_vote, down_vote, up_vote_anwfi, down_vote_anwfi });
      await proposal.save();
      return proposal;
    } catch (e) {
      console.log(e.message);
      return;
    }
  }

}

module.exports = ProposalService