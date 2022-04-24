'use strict'
const AdminService = use('App/Services/AdminService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const randomString = use('random-string');
class AdminController {

  async create({ request, auth }) {
    try {
      const inputs = request.only(['wallet_address', 'role', 'firstname', 'lastname', 'email']);
      const authRole = auth.user.role;
      if (parseInt(authRole) < parseInt(inputs.role)) {
        return HelperUtils.responseBadRequest('ERROR: you are now allowed to create this user!');
      }
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
  async update({ request, auth }) {
    try {
      const inputs = request.only(['role', 'firstname', 'lastname', 'email', 'wallet_address']);
      const id = request.params.id;
      const authRole = auth.user.role;

      console.log('Update Admin with params: ', inputs);
      const adminService = new AdminService();
      const admin = await adminService.findUser({
        id,
      });

      if (admin) {
        // check if auth.user has role to modify this profile.
        if (parseInt(admin.role) > parseInt(authRole)) {
          return HelperUtils.responseBadRequest('Error: you are not allowed to modify this user!');
        }
        if (parseInt(inputs.role) > parseInt(authRole)) {
          return HelperUtils.responseBadRequest('ERROR: you are trying to change role of this user to a higher lever than your role!');
        }
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
  async delete({ request, auth }) {
    try {
      const id = request.params.id;
      const authRole = auth.user.role;

      console.log('delete Admin with params: ', id);
      const adminService = new AdminService();
      const admin = await adminService.findUser({
        id
      });
      if (admin) {
        if (parseInt(admin.role) > parseInt(authRole)) {
          return HelperUtils.responseBadRequest("Error: you cannot delete this user!");
        }
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