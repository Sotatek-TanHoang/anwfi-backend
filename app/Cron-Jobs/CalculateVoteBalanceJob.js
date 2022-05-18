const Queue = require("bull");
const _ = require("lodash");
const HelperUtils = use('App/Common/HelperUtils')
const { BigNumber } = require("bignumber.js");
const Const = use("App/Common/Const");
const ContractService = use("App/Services/ContractService")
const ProposalService = use("App/Services/ProposalService")
const VoteService = use("App/Services/VoteService")
const ProposalModel=use("App/Models/Proposal")
const Database = use("Database")
// const ProjectService = use("App/Services/ProjectService");

const pLimit = require("../Common/ProcessLimit");
const limit = pLimit(Const.LIMIT_PROCESS_NUMBER);

const caculateVoteResultQueue = new Queue(Const.ALLOCATION_CACULATION_QUEUE, {
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

    const proposal = await proposalService.findOne({
      id: proposal_id,
      status: `${Const.PROPOSAL_STATUS.ACTIVE}`
    })

    if (!proposal){
      await job.finished();
      throw new Error("Error: proposal not exist")
    }
    // get proposal's votes
    const totalVotes = await VoteService.findMany({ proposal_id })
    // update votes balance
    const updatedVotes = await Promise.all(
      totalVotes.map(async (vote) =>
        limit(async () => {
          const balance = await contractService.balanceOf(vote.wallet_address);
          vote.balance = balance;
          vote.status = HelperUtils.compareBigNumber(balance, proposal.toJSON().min_anwfi);
          return await vote.save();
        })
      )
    );
    // filter verified votes
    const verifiedVotes = updatedVotes.filter(v => v.status)
    // calc total vote anwfi
    const totalAnwfi = new BigNumber(0)
    verifiedVotes.forEach(vote => {
      totalAnwfi.plus(BigNumber(vote.balance))
    })

    const isProposalPass = HelperUtils.compareBigNumber(totalAnwfi, proposal.quorum);
    // determine proposal status
    if (isProposalPass) {
      proposal.proposal_status = Const.PROPOSAL_STATUS.SUCCESS;
    } else {
      proposal.proposal_status = Const.PROPOSAL_STATUS.FAILED;
    }
    // save timestamp of result;
    proposal.tmp_result = ProposalModel.formatDates('tmp_result', new Date().toISOString());
    await proposal.save();
    await job.finished()

  } catch (e) {
    console.log(e);
    await job.moveToFailed(`${JSON.parse(e)}`, false);
  }
});



module.exports = caculateVoteResultQueue;
