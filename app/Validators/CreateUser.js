const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const HelperUtils = use('App/Common/HelperUtils');
class CreateAdmin {
  get rules() {

    return {
      username: 'string',
      wallet_address: 'required|string',
      role: 'required|integer|range:0,3',
      email: 'email'
    };
  }
  async authorize() {
    const authRole = this.ctx.auth.user.role;
    const inputs = this.ctx.request.only(['role']);
    // user cannot update a higher role than his/her role.
    if (parseInt(inputs.role) > parseInt(authRole)) {
      this.ctx.response.forbidden(HelperUtils.responseForbidden("Error: you are not allowed to create user with higher role than yours."))
      return false;
    }

    return true
  }
  get messages() {
    return {
      'wallet_address.required': 'You must provide a wallet address.',
      'role.required': 'You must provide a role.',
      'email.email': "You must provide a valid email",
      "role.range":"Role not match any predefined roles."
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
