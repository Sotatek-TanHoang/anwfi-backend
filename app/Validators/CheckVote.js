const ErrorFactory = use('App/Common/ErrorFactory');
const ProposalService=use("App/Services/ProposalService")
const Const=use('App/Common/Const')
const ForbiddenException = use("App/Exceptions/ForbiddenException")

const moment=require('moment')
class CheckVote {
    get rules() {

        return {
            vote: "boolean|required"
        };
    }
    async authorize(){
        try{
            const id=this.ctx.params.id;
        const proposalService=new ProposalService()
        const proposal=await proposalService.findOne({
            id,
            status:`${Const.PROPOSAL_STATUS.ACTIVE}`
        })
        if(!proposal){
            throw new ForbiddenException("ERROR: Proposal not exist!")
        }
        const nowUTC=new Date().toISOString();
        if(moment(nowUTC).isBefore(proposal.end_time)){
            return true;
        }
        throw new ForbiddenException("ERROR: you cannot vote for this proposal right now!")
        }catch(e){
            throw new Error("ERROR: Internal Server Error!")
        }

    }
    get messages() {
        return {};
    }

    get validateAll() {
        return true;
    }

    async fails(errorMessage) {
        return ErrorFactory.validatorException(errorMessage)
    }
}

module.exports = CheckVote;
