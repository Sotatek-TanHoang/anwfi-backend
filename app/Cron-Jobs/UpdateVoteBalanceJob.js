const Queue = require("bull");
const _ = require("lodash");
const HelperUtils = use('App/Common/HelperUtils')
const { BigNumber } = require("bignumber.js");
const Const = use("App/Common/Const");
const ProposalService = use("App/Services/ProposalService")
const VoteService = use("App/Services/VoteService")
const ProposalModel = use("App/Models/Proposal")

// const ProjectService = use("App/Services/ProjectService");

const pLimit = require("../Common/ProcessLimit");
const limit = pLimit(Const.LIMIT_PROCESS_NUMBER);

const updateVoteResultQueue = new Queue(Const.UPDATE_VOTE_QUEUE, {
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
updateVoteResultQueue.process(async (job) => {
    try {
        console.log("Process Job id: ", job.id);
        // init services

        const proposalService = new ProposalService()
        const voteService = new VoteService()

        const totalActiveProposals = await proposalService.findMany({ status: `${Const.PROPOSAL_STATUS.ACTIVE}` })

        await Promise.all(
            totalActiveProposals.map(async (proposal) =>
                limit(async () => {
                    await voteService.calcBalance(proposal.id)
                    await proposalService.calcVoteResult(proposal.id)
                    return;
                })
            )
        );

    } catch (e) {
        console.log(e);
        await job.moveToFailed(`${JSON.parse(e)}`, false);
    }
});

updateVoteResultQueue.on('completed', async (job) => await job.remove())

module.exports = updateVoteResultQueue;
