const ErrorFactory = use('App/Common/ErrorFactory');

class UpdateProjectAirdrop {
  get rules() {
    return {
      token_icon: 'required',
      token_symbol: 'required|max:11',
      token_name:'required',
      token_address: 'required|min:32|max:42',
      project_type: 'required|number',
      distribution_method: 'required|number',
    };
  }

  get messages() {
    return {
      'project_type.required': 'You must provide a project type.',
      'project_type.number': 'Project type is not correct.',
      'distribution_method.required': 'You must provide a project distribution method.',
      'distribution_method.number': 'Project distribution method is not correct.',
      'token_address.required': 'You must provide a token address',
      'token_address.min': '32 characters minimum',
      'token_address.max': '42 characters maximum',
      'token_symbol.required': 'You must provide a token symbol',
      'token_symbol.max': '11 characters maximum',
      'token_icon.required': 'You must provide token icon',
    };
  }

  get validateAll() {
    return true;
  }

  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = UpdateProjectAirdrop;
