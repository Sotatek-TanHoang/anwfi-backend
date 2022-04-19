const ErrorFactory = use('App/Common/ErrorFactory');
class AddWhitelistUsers {
  get rules() {
    return {
      wallet_address: 'required',
      project_id: 'required',
    };
  }

  get messages() {
    return {
      'wallet_address.required': 'You must provide a wallet address.',
      'project_id.required': 'You must provide a project_id for add.',
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = AddWhitelistUsers;
