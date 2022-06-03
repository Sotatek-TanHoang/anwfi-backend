"use strict";
const Const = use('App/Common/Const')
const HelperUtils = use('App/Common/HelperUtils');
class CheckProposalRole {
  async handle({ response, auth }, next) {

    const authRole = auth.user.role;
    // only admin is allow to process.
    switch (authRole) {
      case Const.USER_ROLE.ADMIN:
      case Const.USER_ROLE.GOVERNANCE:
        return await next();
    }
    return response.forbidden(HelperUtils.responseForbidden('ERROR: Only admin and governance is allowed!'))
  }
}

module.exports = CheckProposalRole;
