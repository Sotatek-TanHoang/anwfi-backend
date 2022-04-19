'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const UserModel = use('App/Models/User');
const PasswordResetModel = use('App/Models/PasswordReset');
const randomString = use('random-string');
const Const = use('App/Common/Const');
const HelperUtils = use('App/Common/HelperUtils');

class UserService {
  buildQueryBuilder(params) {
    let builder = UserModel.query();
    if (params.id) {
      builder = builder.where('id', params.id);
    }
    if (params.username) {
      builder = builder.where('username', params.username);
    }
    if (params.email) {
      builder = builder.where('email', params.email);
    }
    if (params.signature) {
      builder = builder.where('signature', params.signature);
    }
    if (params.wallet_address) {
      builder = builder.where('wallet_address', params.wallet_address);
    }
    if (params.type) {
      builder = builder.where('type', params.type);
    }
    if (params.role) {
      builder = builder.where('role', params.role);
    }
    if (params.confirmation_token) {
      builder = builder.where('confirmation_token', params.confirmation_token);
    }
    if (params.status !== undefined) {
      builder = builder.where('status', params.status);
    } 
    return builder;
  }

  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('email', 'like', `%${searchQuery}%`)
        .orWhere('wallet_address', 'like', `%${searchQuery}%`);
    })
  }

  async findUser(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }

  async updateUser(params, userAuthInfo) {
    let query = this.buildQueryBuilder(userAuthInfo);
    const result = await query.update(params);
    return result;
  }


  async confirmEmail(token) {
    const user = await this.findUser({
      confirmation_token: token,
      status: Const.USER_STATUS.UNVERIFIED,
    });          
    console.log('user======>', JSON.stringify(user));
    if (!user) {
      // User not exist
      return false;
    }

    const timeSendMail = Number(token.substring(token.indexOf(".")+1));
    const currTime = HelperUtils.seconds_since_epoch(new Date()).toString()
    
    if(currTime - timeSendMail > Const.EXPIRE_TOKEN_TIME) {
      return false
    }

    let userExist = await this.buildQueryBuilder({
      wallet_address: user.wallet_address,
      status: Const.USER_STATUS.ACTIVE,
    }).where('id', '!=', user.id).first();

    if (userExist) {
      await UserModel.query().where('id', user.id).delete();
      return false;
    }

    userExist = await this.buildQueryBuilder({
      email: user.email,
      status: Const.USER_STATUS.ACTIVE,
    }).where('id', '!=', user.id).first();

    if (userExist) {
      await UserModel.query().where('id', user.id).delete();
      return false;
    }

    console.log('========================');
    console.log('USER NEED VERIFY CONFIRM:');
    console.log(JSON.stringify(user));
    console.log('========================');
    console.log('USER ACTIVED EXIST:');
    console.log(JSON.stringify(userExist));
    console.log('========================');

    console.log('Confirm Email for USER ID', user.id);
    user.confirmation_token = null;
    user.status = Const.USER_STATUS.ACTIVE;
    user.save();
    return true;
  }
}

module.exports = UserService
