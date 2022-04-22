const BaseService = use('App/Services/BaseService');
const Const = use('App/Common/Const');
const ErrorFactory = use('App/Common/ErrorFactory');
const AdminModel = use('App/Models/Admin');
const AdminService = use('App/Services/AdminService');

class AuthAdminService extends BaseService {

  async login(params) {
    const userService = new AdminService();
    const filterParams = {
      wallet_address: params.wallet_address,
      role: params.role,
    };
    console.log('Login with filterParams: ', filterParams);

    const user = await userService.findUser(filterParams);
    if (!user) {
      ErrorFactory.unauthorizedInputException('The current ethereum address has not been signed up on the system !', Const.ERROR_CODE.AUTH_ERROR.ADDRESS_NOT_EXIST);
    }

    // const isMatchPassword = await Hash.verify(params.password, user.password);

    // if (!isMatchPassword) {
    //   ErrorFactory.unauthorizedInputException('Incorrect password !', Const.ERROR_CODE.AUTH_ERROR.PASSWORD_NOT_MATCH);
    // }
    return user;
  }

  async checkIssetUser({ email, role }) {
    const user = await AdminModel.query()
      .where('role', role)
      .where('email', email)
      .where('status', Const.USER_STATUS.ACTIVE)
      .first();
    return user;
  }

  async checkWalletUser({wallet_address, role}) {
    const user = await AdminModel.query()
      .where('role', role)
      .where('wallet_address', wallet_address)
      .where('status', Const.USER_STATUS.ACTIVE)
      .first();
    return user;
  }

  async createUser({email, firstname,lastname, wallet_address, type, role}) {
    // const isExistWhitelistUser = await this.checkExistWhitelistUser({ email });
    // const userType = isExistWhitelistUser ? Const.USER_TYPE.WHITELISTED : Const.USER_TYPE.REGULAR;
    try {
      const user = new AdminModel;
      user.email = email;
      user.username = email;
      user.firstname=firstname
      user.lastname=lastname
      // user.password = password;
      user.wallet_address = wallet_address;
      // user.signature = signature;
      user.role = role || Const.USER_ROLE.ADMIN;
      user.type = Const.USER_TYPE.WHITELISTED;  // Always whitelisted
      await user.save();
      return user;
    } catch (e) {
      console.error(e);
      return ErrorFactory.internal('error')
    }
  }
}

module.exports = AuthAdminService;
