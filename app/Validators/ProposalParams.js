const ErrorFactory = use('App/Common/ErrorFactory');
class ProposalParams {
  get rules() {
    return {
      proposal_type:"required|string",
      current_value:"number",
      new_value:"number",
      description:"string",
      is_display:"required|boolean",
      start_time:"date",
      end_time:"date",
      quorum:"number",
      min_anwfi:"number",
      pass_percentage:"number",
      
    };
  }

//   get messages() {
//     return {
//       'wallet_address.required': 'You must provide a wallet address.',
//       'signature.required': 'You must provide a signature.',
//       // 'password.required': 'You must provide a password.',
//     };
//   }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = ProposalParams;
