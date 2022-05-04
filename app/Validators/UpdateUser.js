const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const UserService = use('App/Services/UserService');
const HelperUtils = use('App/Common/HelperUtils');

class UpdateAdmin {
  get rules() {
    return {
      firstname: 'string',
      lastname: 'string',
      wallet_address: "string|required",
      role: "integer|required|range:-1,5",
      email: 'email'
    };
  }

  get messages() {
    return {
      'email.email': "You must provide a valid email",
      "role.range":"Role not match any predefined roles."
    };
  }

  get validateAll() {
    return true;
  }
  async authorize() {
    const id = this.ctx.request.params.id;
    const authUserId = this.ctx.auth.user.id;
    const authRole = this.ctx.auth.user.role;
    const inputs = this.ctx.request.only('role');
    // user cannot modify his/her own role.
    if (parseInt(id) === parseInt(authUserId)) {
      if (parseInt(authRole) !== parseInt(inputs.role))
        throw new ForbiddenException("Error: you are not allowed to modify your own role.")
    }
    // user cannot set a higher role than his/her role.
    if (parseInt(inputs.role) > parseInt(authRole)) {
      throw new ForbiddenException("Error: you are not allowed to set higher role than yours.")
    }
    // check user is privileged to change target profile.
    const adminService = new UserService();
    const admin = await adminService.findUser({
      id,
    });
    // target user not exist.
    if (!admin) {
      throw new ForbiddenException("Error: you are trying to modify non-existing user.")
    }
    // target user is more privileged.
    if (parseInt(admin.role) > parseInt(authRole)) {
      throw new ForbiddenException("Error: you are not allowed to modify this user profile.")
    }

    return true
  }
  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = UpdateAdmin;
