const ErrorFactory = use('App/Common/ErrorFactory');
class CreateAdmin {
  get rules() {
    return {
      // firstname: 'required',
      // lastname: 'required',
      wallet_address: 'required',
      role:'required'
    };
  }

  get messages() {
    return {
      'wallet_address.required': 'You must provide a wallet address.',
      // 'firstname.required': 'You must provide a firstname',
      // 'lastname.required': 'You must provide a lastname',
      'role.required':'You must provide a role.'
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = CreateAdmin;
