const ErrorFactory = use('App/Common/ErrorFactory');
class CreateAdmin {
  get rules() {
    return {
      firstname: 'string',
      lastname: 'string',
      wallet_address:"string|required",
      role:"number|required",
      email:'email'
    };
  }

  get messages() {
    return {
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
