const ErrorFactory = use('App/Common/ErrorFactory');
class WhiteListParams {
  get rules() {
    return {
      page: 'number|min:1',
      limit: 'number|min:1'
    };
  }

  get messages() {
    return {
      'page.number': 'You must provide a number',
      'page.min': 'mix is 1',
      'limit.min': 'min is 1',
      'limit.number': 'You must provide a number'
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = WhiteListParams;
