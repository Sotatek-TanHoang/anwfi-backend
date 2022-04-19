'use strict'

const UserService = use('App/Services/UserService');
const HelperUtils = use('App/Common/HelperUtils');
const UserModel = use('App/Models/User');



class UserController {

  async confirmEmail({ request }) {
    try {
      const token = request.params.token;
      const userService = new UserService();
      const checkToken = await userService.confirmEmail(token);
      if (!checkToken) {
        return HelperUtils.responseErrorInternal('Active account link has expried.');
      }
      return HelperUtils.responseSuccess(checkToken);
    } catch (e) {
      console.log('ERROR: ', e);
      if (e.status === 400) {
        return HelperUtils.responseNotFound(e.message);
      } else {
        return HelperUtils.responseErrorInternal('ERROR: Confirm email fail !');
      }
    }
  }

  async profile({ request }) {
    try {
      const params = request.all();
      const wallet_address = params.wallet_address;
      const findedUser = await UserModel.query().where('wallet_address', wallet_address).first();
      if (!findedUser) {
        return HelperUtils.responseNotFound();
      }
      // const whitelistSubmission = JSON.parse(JSON.stringify(
      //   await (new WhitelistSubmissionService).findSubmission({ wallet_address })
      // ));

      return HelperUtils.responseSuccess({
        findedUser
      });
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal();
    }
  }

}

module.exports = UserController;
