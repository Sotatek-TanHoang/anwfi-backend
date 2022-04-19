const ErrorFactory = use('App/Common/ErrorFactory');

class UpdateProject {
  get rules() {
    return {
      token_icon: 'required',
      token_symbol: 'required|max:11',
      token_name:'required',
      token_address: 'required|min:32|max:42',
      min_stake: 'required|number',
      max_stake: 'required|number',
      project_type: 'required|number',
      start_time: 'required',
      finish_time: 'required',
      announce_time: 'required',
      distribute_time: 'required',
    };
  }

  get messages() {
    return {
      'project_type.required': 'You must provide a project type.',
      'project_type.number': 'Project type is not correct.',
      'token_address.required': 'You must provide a token address',
      'token_address.min': '32 characters minimum',
      'token_address.max': '42 characters maximum',
      'token_symbol.required': 'You must provide a token symbol',
      'token_symbol.max': '11 characters maximum',
      'start_time.required': 'You must provide start time to whitelist',
      'finish_time.required': 'You must provide finish time to whitelist',
      'min_stake.required': 'You must provide min stake',
      'min_stake.number': 'Min stake type is not correct.',
      'max_stake.required': 'You must provide max stake',
      'max_stake.number': 'Max stake type is not correct.',
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

module.exports = UpdateProject;
