const ErrorFactory = use('App/Common/ErrorFactory');
const HelperUtils = use('App/Common/HelperUtils')
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const ProposalService = use('App/Services/ProposalService')
const Const = use('App/Common/Const')
const { rule } = use('Validator')
const moment = require('moment')
class ProposalParams {
  get rules() {
    return {
      proposal_type: "required|string",
      name: "required|string",
      current_value: "number|required",
      new_value: "number|required",
      description: "string",
      start_time: [
        rule('required'),
        rule('date'),
        rule('dateFormat', 'YYYY-MM-DD HH:mm:ss')
      ],
      end_time: [
        rule('date'),
        rule('dateFormat', 'YYYY-MM-DD HH:mm:ss')
      ],
      min_anwfi: "number|required",
      quorum: "range:-1,10001|integer|required",
      pass_percentage: "range:-1,10001|integer|required",

    };
  }
  async authorize() {
    const { proposal_type, start_time, end_time } = this.ctx.request.only(['proposal_type', 'start_time', 'end_time'])

    if (moment(end_time).isBefore(start_time)) {
      this.ctx.response.badRequest(HelperUtils.responseBadRequest("Error: end_time must be after start_time!"))
      return false;
      // throw new ForbiddenException("Error: end_time must be after start_time!")
    }

    //Todo: check if other proposal of this type is active.
    
    // const proposalService = new ProposalService();
    // const otherProposal = await proposalService.findOne({
    //   proposal_type,
    //   end_time_after: new Date(start_time).toISOString()
    // })
    // if (otherProposal) {
    //   this.ctx.response.badRequest(HelperUtils.responseBadRequest("Error: Other proposal with this proposal_type is active now!"))
    //   return false;
    // }


    // proposal_type must match those types:
    switch (proposal_type) {
      case Const.PROPOSAL_TYPE.LIQUIDITY_PROVIDER_FEE:
      case Const.PROPOSAL_TYPE.SWAP_FEE:
      case Const.PROPOSAL_TYPE.STAKE_FEE:
      case Const.PROPOSAL_TYPE.ANWFI_REWARD_PER_BLOCK:
      case Const.PROPOSAL_TYPE.OFFCHAIN_PROPOSAL:
        break;
      default:
        this.ctx.response.unauthorized(HelperUtils.responseBadRequest("Error: proposal_type is invalid!"))
        return false;
      // throw new ForbiddenException("Error: proposal_type is invalid!")
    }
    return true;
  }

  get validateAll() {
    return true;
  }
  get messages() {
    return {
      'end_time.dateFormat': 'Error: valid date format is YYYY-MM-DD HH:mm:ss',
      'start_time.dateFormat': 'Error: valid date format is YYYY-MM-DD HH:mm:ss',
    };
  }



  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = ProposalParams;
