'use strict'
const UserService = use('App/Services/UserService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Database = use('Database')

class UserController {

  async createUser({ request }) {
    try {
      const inputs = request.only(['wallet_address', 'role', 'firstname', 'lastname', 'email']);
      // convert wallet_address
      inputs.wallet_address = HelperUtils.checkSumAddress(inputs.wallet_address)
      console.log('Create User with params: ', inputs);

      const userService = new UserService();
      const isExistUser = await userService.findUser({
        wallet_address: inputs.wallet_address,
      });
      if (isExistUser) {
        return HelperUtils.responseBadRequest('Wallet is used');
      }

      const user = new UserModel();
      user.fill(inputs);
      user.status = Const.USER_STATUS.ACTIVE;
      await user.save();

      //TODO: Send mail to admin after create account

      // const authService = new AuthService();
      // await authService.sendAdminInfoEmail({
      //   user: admin,
      //   password: request.input('password'),
      // });

      return HelperUtils.responseSuccess(user);
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: create user fail !');
    }
  }
  async bulkCreateUser({ request }) {
    // begin transaction.
    const trx = await Database.beginTransaction()
    try {
      const { users } = request.only(['users']);

      const newUsers = users.map((data = {}) => ({
        wallet_address: HelperUtils.checkSumAddress(data.wallet_address),
        role:Const.USER_ROLE.PUBLIC_USER,
        firstname: data.fisrtname,
        lastname: data.lastname,
        email: data.email
      }))
      
      const bulk = await Promise.all(newUsers.map(async (input) => {
        try {
          await UserModel.create(input,trx);      
          return { success: true, data: input, message: "user created" }
        } catch (e) {
          console.log(e.message);
          throw new Error("one of user creation is failed")
        }
      }))
      await trx.commit()

      return HelperUtils.responseSuccess(bulk);
    } catch (e) {
      console.log(e.message);
      await trx.rollback();
      return HelperUtils.responseErrorInternal('ERROR: bulk create users fail !');
    }
  }
  async updateUserProfile({ request }) {
    try {
      const inputs = request.only(['role', 'firstname', 'lastname', 'email', 'wallet_address']);
      inputs.wallet_address = HelperUtils.checkSumAddress(inputs.wallet_address)
      const id = request.params.id;

      console.log('Update User with params: ', inputs);
      const userService = new UserService();
      const admin = await userService.findUser({
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
      return HelperUtils.responseErrorInternal('ERROR: update user fail!');
    }
  }
  async deleteUser({ request }) {
    try {
      const id = request.params.id;
      console.log('delete User with params: ', id);

      const userService = new UserService();
      const admin = await userService.findUser({
        id
      });
      if (admin) {
        admin.status = Const.USER_STATUS.DELETED;
        await admin.save()
        return HelperUtils.responseSuccess(admin);
      }
      return HelperUtils.responseBadRequest("Error: Delete non-existing user!");
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: delete user fail!');
    }
  }
  async getUserList({ request }) {
    try {
      const params = request.only(['limit', 'page']);
      const searchQuery = request.input('searchQuery');
      const limit = params.limit || Const.DEFAULT_LIMIT;
      const page = params.page || 1;

      const userService = new UserService();
      let adminQuery = userService.buildQueryBuilder(params);
      if (searchQuery) {
        adminQuery = userService.buildSearchQuery(adminQuery, searchQuery);
      }
      const admins = await adminQuery.paginate(page, limit);
      return HelperUtils.responseSuccess(admins);
    } catch (e) {
      console.log(e.message);
      return HelperUtils.responseErrorInternal('ERROR: get user list fail !');
    }
  }

  async getUserDetail({ params }) {
    try {
      const id = params.id;
      const userService = new UserService();
      const admin = await userService.findUser({ id });
      if (admin) {
        return HelperUtils.responseSuccess(admin);
      }
      return HelperUtils.responseErrorInternal('ERROR: user not exist!');
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: user not exist!');
    }
  }
}

module.exports = UserController