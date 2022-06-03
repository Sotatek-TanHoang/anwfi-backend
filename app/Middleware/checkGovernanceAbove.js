"use strict";
const Const = use('App/Common/Const')
const HelperUtils = use('App/Common/HelperUtils');
class checkGovernanceAbove {
  async handle({ response, auth }, next) {

    const authRole = auth.user.role;
    // only admin is allow to process.
    switch (authRole) {
      case Const.USER_ROLE.SUPER_ADMIN:
      case Const.USER_ROLE.ADMIN:
      case Const.USER_ROLE.GOVERNANCE:  
        return await next();
    }
    return response.forbidden(HelperUtils.responseForbidden('ERROR: user role not allowed!'))
  }
}

module.exports = checkGovernanceAbove;
