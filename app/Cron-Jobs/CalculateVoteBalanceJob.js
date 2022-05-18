const Queue = require("bull");
const _ = require("lodash");
const HelperUtils = use('App/Common/HelperUtils')
const { BigNumber } = require("bignumber.js");
const Const = use("App/Common/Const");
const ContractService = use("App/Services/ContractService")
const ProposalService = use("App/Services/ProposalService")
const VoteService = use("App/Services/VoteService")
const ProposalModel = use("App/Models/Proposal")

const pLimit = require("../Common/ProcessLimit");
const limit = pLimit(Const.LIMIT_PROCESS_NUMBER);

const caculateVoteResultQueue = new Queue(Const.CALCULATE_VOTE_QUEUE, {
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  settings: {
    lockDuration: 1000,
    maxStalledCount: 0,
  },
});
caculateVoteResultQueue.process(async (job) => {
  try {
    console.log("Process Job id: ", job.id);
    const proposal_id = job.data.proposal_id;
    // init services

    const proposalService = new ProposalService()
    const contractService = new ContractService()

    let proposal = await proposalService.findOne({
      id: proposal_id,
      status: `${Const.PROPOSAL_STATUS.ACTIVE}`
    })

    if (!proposal) {
      console.log('Error: proposal not exist, Job terminated.');
      return;
    }
    // get proposal's votes
    const totalVotes = await VoteService.findMany({ proposal_id })
    // update votes balance
    await Promise.all(
      totalVotes.map(async (vote) =>
        limit(async () => {
          const balance = await contractService.balanceOf(vote.wallet_address);
          vote.balance = balance;
          vote.status = HelperUtils.compareBigNumber(balance, proposal.toJSON().min_anwfi);
          await vote.save();
          return vote
        })
      )
    );

    proposal = await proposalService.calcVoteResult(proposal.id);

    const passPercentage = calcPercentage({
      up_vote: proposal.up_vote,
      down_vote: proposal.down_vote
    });

    const quorumPercentage=calcPercentage({
      up_vote:proposal.up_vote_anwfi,
      down_vote:proposal.down_vote_anwfi
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
    await proposal.save();
  } catch (e) {
    console.log(e);
    await job.moveToFailed(`${JSON.parse(e)}`, false);
  }
});

caculateVoteResultQueue.on('completed', async (job) => await job.remove())


// helper


function calcPercentage({ up_vote, down_vote }) {

  let vote_yes = new BigNumber(up_vote);
  let total = new BigNumber(vote_yes.plus(BigNumber(down_vote)));
  // range from 0 to 10000
  let result = vote_yes.dividedBy(total).multipliedBy(BigNumber(10000)).decimalPlaces(0);
  return result.toString();
}
module.exports = caculateVoteResultQueue;
