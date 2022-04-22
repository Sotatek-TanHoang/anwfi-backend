'use strict'

const AuthService = use('App/Services/AuthService');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Web3 = require('web3');
const UserModel = use('App/Models/User');

class UserAuthController {


  async login({request, auth, params}) {
    const type = params.type;
    if (type !== Const.USER_TYPE_PREFIX.ADMIN && type !== Const.USER_TYPE_PREFIX.PUBLIC_USER) {
      return HelperUtils.responseNotFound('Not valid !');
    }
    const param = request.all();
    const wallet_address = Web3.utils.toChecksumAddress(param.wallet_address)
    const filterParams = {
      'wallet_address': wallet_address
    };
    try {
      const authService = new AuthService();
      const user = await authService.login({
        ...filterParams
      });

      const token = await auth.generate(user, true);
      return HelperUtils.responseSuccess({
        user,
        token,
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseNotFound('ERROR: User login fail !');
    }
  }

  async register({request, auth, params}) {
    try {
      const param = request.only(['username', 'signature', 'password', 'wallet_address'])
      const wallet_address = Web3.utils.toChecksumAddress(request.input('wallet_address'));
      console.log(111, wallet_address)
      const type = params.type;
      const role = type === Const.USER_TYPE_PREFIX.ADMIN ? Const.USER_ROLE.ADMIN : Const.USER_ROLE.PUBLIC_USER;

      const authService = new AuthService();
      let user;
      user = await authService.checkWalletUser({wallet_address, role});
      if (user) {
        return HelperUtils.responseNotFound('The current ethereum address has been used.');
      }
      user = await authService.createUser({
        ...param,
        role,
      });

      return HelperUtils.responseSuccess(null, 'Success! You can register email to fully complete.');
    } catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseErrorInternal('ERROR: User register fail !');
    }
}

  async registerEmail({request, auth, params}) {
    try {
      const param = request.only(['email', 'wallet_address']);
      const wallet_address = Web3.utils.toChecksumAddress(request.input('wallet_address'));
      const authService = new AuthService();
      const type = params.type;
      const role = type === Const.USER_TYPE_PREFIX.ADMIN ? Const.USER_ROLE.ADMIN : Const.USER_ROLE.PUBLIC_USER;
      let user = await authService.checkIssetUser({email: param.email, role});
      console.log(user)

      if (!user) {
        user = await authService.checkWalletUser({wallet_address, role});
        console.log(user)
        if (user && user.$attributes.status === Const.USER_STATUS.UNVERIFIED) {
          const tempToken = await HelperUtils.randomString(50);
          const token = tempToken + "." + HelperUtils.seconds_since_epoch(new Date()).toString();
          user.$attributes.confirmation_token = token;
          user.$attributes.email = param.email;
          await user.save();
          await authService.sendConfirmEmail({role, type, user});
        }
        else {
          return HelperUtils.responseNotFound('The current ethereum address has no used to confirm.');
        }
      }
      else {
        return HelperUtils.responseNotFound('Email address has been used.');
      }

    }
    catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseErrorInternal('ERROR: User register fail !');
    }
  }


}

module.exports = UserAuthController;