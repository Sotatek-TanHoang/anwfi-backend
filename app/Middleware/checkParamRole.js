"use strict";
const Const = use('App/Common/Const')
const HelperUtils = use('App/Common/HelperUtils');
class checkParamRole {
  async handle({ request, response}, next) {

    const { role } = request.only(['role']);
    // new user'role must match these roles.
    switch (role) {
      case Const.USER_ROLE.ADMIN:
      case Const.USER_ROLE.GOVERNANCE:
      case Const.USER_ROLE.SUPER_ADMIN:
      case Const.USER_ROLE.PUBLIC_USER:
        return await next();

    }
    return response.json(HelperUtils.responseBadRequest('ERROR: Invalid role! Role must be parsed to number and match pre-defined roles.'))
  }
}

module.exports = checkParamRole;
