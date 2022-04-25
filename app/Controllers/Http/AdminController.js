'use strict'
const AdminService = use('App/Services/AdminService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const randomString = use('random-string');
class AdminController {

  async create({ request }) {
    try {
      const inputs = request.only(['wallet_address', 'role', 'firstname', 'lastname', 'email']);
      // convert wallet_address
      inputs.wallet_address=HelperUtils.checkSumAddress(inputs.wallet_address)
      console.log('Create Admin with params: ', inputs);

      const adminService = new AdminService();
      const isExistUser = await adminService.findUser({
        wallet_address: inputs.wallet_address,
      });
      if (isExistUser) {
        return HelperUtils.responseBadRequest('Wallet is used');
      }

      const admin = new UserModel();
      admin.fill(inputs);
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
  async update({ request }) {
    try {
      const inputs = request.only(['role', 'firstname', 'lastname', 'email', 'wallet_address']);
      inputs.wallet_address=HelperUtils.checkSumAddress(inputs.wallet_address)
      const id = request.params.id;

      console.log('Update Admin with params: ', inputs);
      const adminService = new AdminService();
      const admin = await adminService.findUser({
        id,
      });

      if (admin) {  
        // update.
        admin.merge(inputs)
        await admin.save();
        return HelperUtils.responseSuccess(admin);
      }
      // user not exist.
      return HelperUtils.responseBadRequest('Error: user not exist!');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: udpate admin fail!');
    }
  }
  async delete({ request }) {
    try {
      const id = request.params.id;
      console.log('delete Admin with params: ', id);
      
      const adminService = new AdminService();
      const admin = await adminService.findUser({
        id
      });
      if (admin) {
        await admin.delete()
        return HelperUtils.responseSuccess(admin);
      }
      return HelperUtils.responseBadRequest("Error: Delete non-existing user!");
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: delete admin fail!');
    }
  }
  async adminList({ request }) {
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

  async adminDetail({ params }) {
    try {
      const id = params.id;
      const adminService = new AdminService();
      const admin = await adminService.findUser({ id });
      if (admin) {
        return HelperUtils.responseSuccess(admin);
      }
      return HelperUtils.responseErrorInternal('ERROR: get admin detail fail !');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: get admin detail fail !');
    }
  }
}

module.exports = AdminController