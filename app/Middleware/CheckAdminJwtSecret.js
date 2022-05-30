"use strict";

const ForbiddenException = use('App/Exceptions/ForbiddenException');
const UserModel = use('App/Models/User')
const HelperUtils = use("App/Common/HelperUtils")
class CheckAdminJwtSecret {
  async handle({ auth, response }, next) {
    
    console.log('User: ', auth.jwtPayload);
    if (!auth || !auth.jwtPayload || !auth.jwtPayload.data) {

      return response.unauthorized(HelperUtils.responseUnauthorized("Sorry, the token expired."))
    }

    const user = await UserModel.query().where('id', auth.jwtPayload.data.id).first();

    const jwtUser = await auth.jwtPayload.data;
    if (!user || (user.token_jwt !== jwtUser.token_jwt)) {
      return response.unauthorized(HelperUtils.responseUnauthorized("Sorry, the token expired."))
    }
    return await next();
  }
}

module.exports = CheckAdminJwtSecret;
