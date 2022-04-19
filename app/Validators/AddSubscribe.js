'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');

class AddSubscribe {
  get rules () {
    return {
      email: 'required|email',
    };
  }

  get messages() {
    return {
      'email.required': 'You must provide a email.',
      'email.email': 'You must to provide the correct email format.',
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = AddSubscribe
