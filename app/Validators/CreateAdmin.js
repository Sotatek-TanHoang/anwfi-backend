const ErrorFactory = use('App/Common/ErrorFactory');
class CreateAdmin {
  get rules() {
    return {
       firstname: 'string',
       lastname: 'string',
      wallet_address: 'required|string',
      role:'required|number',
      email:'email'
    };
  }

  get messages() {
    return {
      'wallet_address.required': 'You must provide a wallet address.',
      // 'firstname.required': 'You must provide a firstname',
      // 'lastname.required': 'You must provide a lastname',
      'role.required':'You must provide a role.',
      'email.email':"You must provide a valid email"
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
