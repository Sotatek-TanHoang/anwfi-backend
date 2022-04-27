const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const HelperUtils = use('App/Common/HelperUtils');
class CreateAdmin {
  get rules() {

    return {
      firstname: 'string',
      lastname: 'string',
      wallet_address: 'required|string',
      role: 'required|number',
      email: 'email'
    };
  }
  async authorize() {
    const authRole = this.ctx.auth.user.role;
    const inputs = this.ctx.request.only('role');
    const isRoleAccepted = HelperUtils.checkWhiteListRole(inputs.role)
    if (!isRoleAccepted) {
      throw new ForbiddenException("Error: you are trying to set a role that is not matched by any predefined role.")
    }
    // user cannot update a higher role than his/her role.
    if (parseInt(inputs.role) > parseInt(authRole)) {
      throw new ForbiddenException("Error: you are not allowed to create user with higher role than yours.")
    }

    return true
  }
  get messages() {
    return {
      'wallet_address.required': 'You must provide a wallet address.',
      // 'firstname.required': 'You must provide a firstname',
      // 'lastname.required': 'You must provide a lastname',
      'role.required': 'You must provide a role.',
      'email.email': "You must provide a valid email"
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
