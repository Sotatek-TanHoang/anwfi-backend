"use strict";

const ForbiddenException = use('App/Exceptions/ForbiddenException');
const UserModel = use('App/Models/User')

class CheckAdminJwtSecret {
  async handle({ auth }, next) {

    console.log('User: ', auth.jwtPayload);
    if(!auth || !auth.jwtPayload || !auth.jwtPayload.data){
      throw new ForbiddenException();
    }

    const user = await UserModel.query().where('id', auth.jwtPayload.data.id).first();
  
    const jwtUser = await auth.jwtPayload.data;
    if (!user || (user.token_jwt !== jwtUser.token_jwt)) {
      throw new ForbiddenException();
    }
    await next();
  }
}

module.exports = CheckAdminJwtSecret;
