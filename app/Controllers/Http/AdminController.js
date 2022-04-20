'use strict'
const AdminService = use('App/Services/AdminService');
const AdminModel = use('App/Models/Admin');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const randomString = use('random-string');
class AdminController {

  async create({request}) {
    try {
      const inputs = request.only(['wallet_address', 'firstname', 'lastname']);
      // inputs.password = request.input('password');
      console.log('Create Admin with params: ', inputs);

      const adminService = new AdminService();
      const isExistUser = await adminService.findUser({
        wallet_address: inputs.wallet_address,
      });
      if (isExistUser) {
        return HelperUtils.responseBadRequest('Wallet is used');
      }

      const admin = new AdminModel();
      admin.fill(inputs);
      // admin.signature = randomString(15);  // TODO: Fill any string
      admin.status = Const.USER_STATUS.ACTIVE;
      await admin.save();

      //TODO: Send mail to admin after create account
      
      // const authService = new AuthService();
      // await authService.sendAdminInfoEmail({
      //   user: admin,
      //   password: request.input('password'),
      // });

      return HelperUtils.responseSuccess(admin);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: create admin fail !');
    }
  }

  async adminList({request}) {
    try {
      const params = request.only(['limit', 'page']);
      const searchQuery = request.input('searchQuery');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;
      
      const adminService = new AdminService();
      let adminQuery = adminService.buildQueryBuilder(params);
      if (searchQuery) {
        adminQuery = adminService.buildSearchQuery(adminQuery, searchQuery);
      }
      const admins = await adminQuery.paginate(page, limit);
      return HelperUtils.responseSuccess(admins);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get admin list fail !');
    }
  }

  async adminDetail({request, params}) {
    try {
      const id = params.id;
      const adminService = new AdminService();
      const admins = await adminService.findUser({id});
      return HelperUtils.responseSuccess(admins);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get admin detail fail !');
    }
  }
}

module.exports = AdminController