'use strict'

const AuthUserService = use('App/Services/AuthUserService');
const UserService = use('App/Services/UserService');
const UserModel=use('App/Models/User')
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Web3 = require('web3');

class UserAuthController {

  async verifyJwtToken({ request, auth }) {
    try {
      const isValid = await auth.check();
      const authUser = await auth.jwtPayload.data;
      const dbUser = await (new UserService).findUser(authUser);
      if (isValid && authUser && dbUser && dbUser.type === Const.USER_TYPE.WHITELISTED) {
        return HelperUtils.responseSuccess({
          msgCode: 'TOKEN_IS_VALID'
        }, 'Token is valid');
      }

      if (dbUser && dbUser.type === Const.USER_TYPE.REGULAR) {
        return HelperUtils.responseSuccess({
          msgCode: 'USER_IS_NOT_IN_WHITELISTED'
        }, 'User is not in white list');
      }

      return HelperUtils.responseSuccess({
        msgCode: 'TOKEN_IS_INVALID'
      }, 'Token is invalid');
    } catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseErrorInternal({
        msgCode: 'TOKEN_IS_INVALID'
      }, 'ERROR: Token is invalid');
    }
  }

  async checkWalletAddress({ request, params }) {
    try {
      const inputs = request.all();
      const walletAddress = HelperUtils.checkSumAddress(inputs.wallet_address || ' ');
      const adminService = new UserService();

      console.log('Wallet: ', walletAddress);
      console.log('Check Wallet: ', inputs, params);
      const user = await adminService.findUser({
        wallet_address: walletAddress,
        // role: params.type === Const.USER_TYPE_PREFIX.ADMIN ? Const.USER_ROLE.ADMIN : Const.USER_ROLE.PUBLIC_USER,
      });
      if (!user) {
        return HelperUtils.responseSuccess({
          walletAddress,
          available: true
        });
      }

      return HelperUtils.responseSuccess({
        walletAddress,
        available: false
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseErrorInternal('ERROR: Wallet address is invalid');
    }
  }

  async login({ request, auth, params ,response}) {
    const type = params.type;
    if (type !== Const.USER_TYPE_PREFIX.ADMIN && type !== Const.USER_TYPE_PREFIX.PUBLIC_USER) {
      return HelperUtils.responseNotFound('ERROR: this api is not properly called!');
    }
    const param = request.all();
    const wallet_address = Web3.utils.toChecksumAddress(param.wallet_address)
    try {
      const authService = new AuthUserService();
      const user = await authService.login({
        'wallet_address': wallet_address,
        //role: Const.USER_ROLE.ADMIN, // governance and admin have different role.
      });

      const token = await auth.authenticator('admin').generate(user, true);
      return HelperUtils.responseSuccess({
        user,
        token,
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return response.notFound(HelperUtils.responseNotFound('ERROR:Login attempt is failed! Call administrators if you have this problem again.'));
    }
  }
  async loginPublicUser({ request, auth, params }) {
    const type = params.type;
    if (type !== Const.USER_TYPE_PREFIX.ADMIN && type !== Const.USER_TYPE_PREFIX.PUBLIC_USER) {
      return HelperUtils.responseNotFound('ERROR: this api is not properly called!');
    }
    const param = request.only("wallet_address");
    const wallet_address = param.wallet_address
    //  Web3.utils.toChecksumAddress(param.wallet_address)
    let user
    try {
      const authService = new AuthUserService();
      user = await authService.login({
        'wallet_address': wallet_address,
        role: Const.USER_ROLE.PUBLIC_USER,
      });
      if (!user) {
        user = new UserModel()
        user.fill(param);
        user.role=Const.USER_ROLE.PUBLIC_USER;
        await user.save()
      }
      const token = await auth.authenticator('user').generate(user, true);
      return HelperUtils.responseSuccess({
        user,
        token,
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseNotFound('ERROR:Login attempt is failed! Call administrators if you have this problem again.');
    }
  }
}

module.exports = UserAuthController;
