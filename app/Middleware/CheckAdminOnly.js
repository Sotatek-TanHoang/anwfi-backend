"use strict";
const Const=use('App/Common/Const')
const HelperUtils = use('App/Common/HelperUtils');
class checkAdminOnly {
  async handle({response,auth}, next) {
        
    const authRole=auth.jwtPayload.data.role;
    
    // only admin is allow to create admin and governance.
    if(authRole !== Const.USER_ROLE.ADMIN){
      return response.json(HelperUtils.responseBadRequest('ERROR: Only admin is allowed!'))
    }
    await next()
  }
}

module.exports = checkAdminOnly;
