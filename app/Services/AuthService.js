const BaseService = use('App/Services/BaseService');
const Const = use('App/Common/Const');
const ErrorFactory = use('App/Common/ErrorFactory');
const UserModel = use('App/Models/User');
const WhitelistUser = use('App/Models/WhitelistUser');
const UserService = use('App/Services/UserService')
const Hash = use('Hash')
const Env = use('Env')
const HelperUtils = use('App/Common/HelperUtils');
const SendConfirmationEmailJob = use('App/Jobs/SendConfirmationEmailJob')

class AuthService extends BaseService {

  async checkIssetUser({ email, role }) {
    const user = await UserModel.query()
      .where('role', role)
      .where('email', email)
      .where('status', Const.USER_STATUS.ACTIVE)
      .first();
    return user;
  }

  async checkWalletUser({wallet_address, role}) {
    const user = await UserModel.query()
      .where('role', role)
      .where('wallet_address', wallet_address)
      .first();
    return user;
  }

  async checkExistWhitelistUser({ email }) {
      const whitelistUser = await WhitelistUser.query().where('email', email).first();
      return whitelistUser;
  }

  async login(params) {
    const userService = new UserService();
    const filterParams = {
      wallet_address: params.wallet_address,
      role: Const.USER_ROLE.PUBLIC_USER
    };
    console.log('Login with filterParams: ', filterParams);

    const user = await userService.findUser(filterParams);
    if (!user) {
      try {
        const isExistWhitelistUser = false;
        const userType = isExistWhitelistUser ? Const.USER_TYPE.WHITELISTED : Const.USER_TYPE.REGULAR;
        
        // create new user
        const newUser = new UserModel;
        newUser.wallet_address = filterParams.wallet_address;
        newUser.role = filterParams.role;
        newUser.type = userType;
        await newUser.save();
        return newUser;
      } catch (e) {
        console.error(e);
        return ErrorFactory.internal('error')
      }
    }
    return user;
  }

  async createUser({email, username, wallet_address, type, role}) {
    // const isExistWhitelistUser = await this.checkExistWhitelistUser({ email });
    const isExistWhitelistUser = false;
    const userType = isExistWhitelistUser ? Const.USER_TYPE.WHITELISTED : Const.USER_TYPE.REGULAR;
    try {
      const user = new UserModel;
      user.email = email;
      user.username = username;
      // user.password = password;
      user.wallet_address = wallet_address;
      // user.signature = signature;
      user.role = role || Const.USER_ROLE.ICO_OWNER;
      user.type = userType;
      await user.save();
      return user;
    } catch (e) {
      console.error(e);
      return ErrorFactory.internal('error')
    }
  }

  async sendConfirmEmail(params) {
    const { role, user, type } = params;
    const mailData = {};
    mailData.username = user.username;
    mailData.email = user.email;

    const isAdmin = type === Const.USER_TYPE_PREFIX.ICO_OWNER;
    const baseUrl = isAdmin ? Env.get('FRONTEND_ADMIN_APP_URL') : Env.get('FRONTEND_USER_APP_URL');
    mailData.url = baseUrl + '/confirm-email/' +
        (isAdmin ? 'admin/' : 'user/') +
        user.confirmation_token;

    SendConfirmationEmailJob.doDispatch(mailData);

    return true;
  }

}

module.exports = AuthService;