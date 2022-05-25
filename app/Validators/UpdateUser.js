const ErrorFactory = use('App/Common/ErrorFactory');
const HelperUtils = use('App/Common/HelperUtils')
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const UserService = use('App/Services/UserService');
const Const = use('App/Common/Const')

class UpdateAdmin {
  get rules() {
    return {
      username: 'string',
      wallet_address: "string|required",
      // role: "integer|required|range:0,5",
      email: 'email'
    };
  }

  get messages() {
    return {
      'email.email': "You must provide a valid email",
      "role.range": "Role not match any predefined roles."
    };
  }

  get validateAll() {
    return true;
  }
  async authorize() {
    // target user
    const id = this.ctx.request.params.id;
    // user perform update
    const authUserId = this.ctx.auth.user.id;
    // jwt role
    const authRole = this.ctx.auth.user.role;
  
    // modify itself
    // user cannot modify his/her own role but other information.
    if (parseInt(id) === parseInt(authUserId)) {
      // allow modify  
      return true;
    }

    if (parseInt(authRole) !== Const.USER_ROLE.SUPER_ADMIN) {
      this.ctx.response.unauthorized(HelperUtils.responseBadRequest("Error: Only super-admin is allowed to perform this action."))
      return false;
      // throw new ForbiddenException("Error: governances are only alowed to update themselves.")
    }

    // update other admin/governance.
    // check user is privileged to change target profile.
    const adminService = new UserService();
    const admin = await adminService.findUser({
      id,
    });
    // target user not exist.
    if (!admin) {
      this.ctx.response.badRequest(HelperUtils.responseBadRequest("Error: you are trying to modify non-existing user."))
      return false;
    }
    // target user is more privileged.
    if (parseInt(admin.role) > parseInt(authRole)) {
      this.ctx.response.badRequest(HelperUtils.responseBadRequest("Error: you are not allowed to modify this user profile."))
      return false;
    }

    return true
  }
  async fails(errorMessage) {
    return ErrorFactory.validatorException(errorMessage)
  }
}

module.exports = UpdateAdmin;
