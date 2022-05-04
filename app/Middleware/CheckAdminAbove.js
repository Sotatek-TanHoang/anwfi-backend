"use strict";
const Const = use('App/Common/Const')
const HelperUtils = use('App/Common/HelperUtils');
class checkAdminAbove {
  async handle({ response, auth }, next) {

    const authRole = auth.user.role;
    // only admin is allow to process.
    switch (authRole) {
      case Const.USER_ROLE.SUPER_ADMIN:
      case Const.USER_ROLE.ADMIN:
        return await next();
    }
    return response.json(HelperUtils.responseBadRequest('ERROR: Only admin is allowed!'))
  }
}

module.exports = checkAdminAbove;
