const ErrorFactory = use('App/Common/ErrorFactory');

class UpdateContractAddress {
  get rules() {
    return {
      project_contract_address:'required'

    };
  }

  get messages() {
    return {
      'project_contract_address.required': 'You must provide project contract address.'
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = UpdateContractAddress;
