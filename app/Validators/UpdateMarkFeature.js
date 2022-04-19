const ErrorFactory = use('App/Common/ErrorFactory');

class UpdateMarkFeature {
  get rules() {
    return {
      id:'required',
      buy_type:'required'
    };
  }

  get messages() {
    return {
      'id.required': 'You must provide project id.',
      'buy_type.required': 'You must provide project type.',
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = UpdateMarkFeature;
