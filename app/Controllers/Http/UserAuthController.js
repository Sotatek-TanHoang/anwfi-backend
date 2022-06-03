'use strict'

const AuthUserService = use('App/Services/AuthUserService');
const UserService = use('App/Services/UserService');
const UserModel = use('App/Models/User')
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

  async checkWalletAddress({ request }) {
      const inputs = request.only(['wallet_address']);
    try {
      const wallet_address = HelperUtils.checkSumAddress(inputs.wallet_address || ' ');
      const adminService = new UserService();

      console.log('Wallet: ', wallet_address);
      console.log('Check Wallet: ', inputs);
      const user = await adminService.findUser({
        wallet_address,
        above_governance:true
      });
      if (!user) {
        return HelperUtils.responseSuccess({
          wallet_address,
          available: true,
          message:'You can use this wallet address!'
        });
      }

      return HelperUtils.responseSuccess({
        wallet_address,
        available: false,
        message:'This address is already used!'
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return HelperUtils.responseSuccess({
        wallet_address:inputs?.wallet_address ?? "no wallet provided",
        available: false,
        message:'This address is invalid !'
      });
    }
  }

  async login({ request, auth, params, response }) {
    const type = params.type;
    if (type !== Const.USER_TYPE_PREFIX.ADMIN && type !== Const.USER_TYPE_PREFIX.PUBLIC_USER) {
      return response.badRequest(HelperUtils.responseNotFound('ERROR: this api is not properly called!'));
    }
    const param = request.all();
    const wallet_address = Web3.utils.toChecksumAddress(param.wallet_address)
    try {
      const authService = new AuthUserService();
      const user = await authService.login({
        'wallet_address': wallet_address
      });
      if (!user) {
        throw new Error("Error: User not exist.")
      }
      const token = await auth.authenticator('admin').generate(user, true);
      return HelperUtils.responseSuccess({
        user,
        token,
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return response.notFound(HelperUtils.responseNotFound('ERROR: Login failed!'));
    }
  }
  async loginPublicUser({ request, auth, params, response }) {
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
        user.role = Const.USER_ROLE.PUBLIC_USER;
        await user.save()
      }
      const token = await auth.authenticator('user').generate(user, true);
      return HelperUtils.responseSuccess({
        user,
        token,
      });
    } catch (e) {
      console.log('ERROR: ', e);
      return response.notFound(HelperUtils.responseNotFound('ERROR:Login attempt is failed! Call administrators if you have this problem again.'));
    }
  }
  async updateUserProfile({ request, auth, response }) {
    try {
      const inputs = request.only(['username', 'email'])

      const profile =await new UserService().findUser({ id: auth.user.id })
      if (!profile)
        throw new Error()
      profile.merge(inputs);
      await profile.save();
      return response.ok(HelperUtils.responseSuccess(profile))
    } catch (e) {
      console.log(e.message);
      return response.badRequest(HelperUtils.responseBadRequest("Error: update profile failed!"))
    }
  }
}

module.exports = UserAuthController;
