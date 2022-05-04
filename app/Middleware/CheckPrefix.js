"use strict";

const ForbiddenException = use('App/Exceptions/ForbiddenException');
const Const = use('App/Common/Const');

class CheckPrefix {
  async handle({ request }, next) {
    const type = request.params.type;
    console.log('User Type: ', type);
    if (!type || (type !== Const.USER_TYPE_PREFIX.ADMIN && type !== Const.USER_TYPE_PREFIX.PUBLIC_USER)) {
      throw new ForbiddenException();
    }

    await next();
  }
}

module.exports = CheckPrefix;
