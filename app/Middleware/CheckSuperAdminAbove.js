"use strict";
const Const = use('App/Common/Const')
const HelperUtils = use('App/Common/HelperUtils');
class CheckSuperAdminAbove {
  async handle({ response, auth }, next) {

    const authRole = auth.user.role;
    // only admin is allow to process.
    switch (authRole) {
      case Const.USER_ROLE.SUPER_ADMIN:
        return await next();
    }
    return response.forbidden(HelperUtils.responseForbidden('ERROR: Only super admin is allowed!'))
  }
}

module.exports = CheckSuperAdminAbove;
