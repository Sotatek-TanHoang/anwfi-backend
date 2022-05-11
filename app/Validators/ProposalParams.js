const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const Const = use('App/Common/Const')
const {rule} = use('Validator')

class ProposalParams {
  get rules() {
    return {
      proposal_type: "required|string",
      current_value: "number",
      new_value: "number",
      description: "string",
      start_time: [
        rule('required'),
        rule('date'),
        rule('dateFormat', 'YYYY-MM-DD HH:mm:ss')
      ],
      end_time: [
        rule('required'),
        rule('date'),
        rule('dateFormat', 'YYYY-MM-DD HH:mm:ss')
      ],
      quorum: "number",
      min_anwfi: "number",
      pass_percentage: "range:-1,10001|integer",

    };
  }
  async authorize() {
    const { proposal_type } = this.ctx.request.only(['proposal_type'])
    // proposal_type must match those types:
    switch (proposal_type) {
      case Const.PROPOSAL_TYPE.LIQUIDITY_PROVIDER_FEE:
      case Const.PROPOSAL_TYPE.SWAP_FEE:
      case Const.PROPOSAL_TYPE.STAKE_FEE:
      case Const.PROPOSAL_TYPE.ANWFI_REWARD_PER_BLOCK:
      case Const.PROPOSAL_TYPE.OFFCHAIN_PROPOSAL:
        return true;
      default:
        throw new ForbiddenException("Error: proposal_type is invalid!")
    }
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
