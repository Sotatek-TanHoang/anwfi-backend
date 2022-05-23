'use strict'
const UserService = use('App/Services/UserService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Database = use('Database')

class UserController {

  async createUser({ request, response }) {
    try {
      const inputs = request.only(['wallet_address', 'role', 'username', 'email']);
      // convert wallet_address
      inputs.wallet_address = HelperUtils.checkSumAddress(inputs.wallet_address)
      console.log('Create User with params: ', inputs);

      const userService = new UserService();
      const isExistUser = await userService.findUser({
        wallet_address: inputs.wallet_address,
      });
      if (isExistUser) {
        return response.badRequest(HelperUtils.responseBadRequest('Wallet is used'));
      }

      const user = new UserModel();
      user.fill(inputs);
      user.status = Const.USER_STATUS.ACTIVE;
      await user.save();

      return HelperUtils.responseSuccess(user);
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: create user fail !'));
    }
  }
  async bulkCreateUser({ request }) {
    // begin transaction.
    const trx = await Database.beginTransaction()
    try {
      const { users } = request.only(['users']);

      // const bulkUsers=await UserModel.createMany(newUsers)
      const bulk = await Promise.all(users.map(async (input) => {
        try {
          await UserModel.create(input, trx);
          return { success: true, data: input, message: "user created" }
        } catch (e) {
          return { success: false, data: input, message: e.message }
        }
      }))
      if (bulk.some(result => !result.success)) {
        await trx.rollback();
        return HelperUtils.responseSuccess({ result: bulk }, "ERROR: some users are failed to create.");
      }
      await trx.commit()
      return HelperUtils.responseSuccess({ result: bulk, message: "success." });
    } catch (e) {
      console.log(e.message);
      await trx.rollback();
      return HelperUtils.responseErrorInternal('ERROR: bulk create users fail !');
    }
  }
  async bulkUpdateUser({ request }) {
    // begin transaction.
    const trx = await Database.beginTransaction()
    try {
      const { users } = request.only(['users']);
      const userService = new UserService()
      // update all role to public except SUPER_ADMIN.
      await trx.update({ role: Const.USER_ROLE.PUBLIC_USER }).into('users').where('role', '<', Const.USER_ROLE.SUPER_ADMIN)
      // update user in the list, if not exist then create.
      for (let input of users) {

        const user = await userService.findUser({
          wallet_address: input.wallet_address
        })
        // if user exist
        if (user) {

          input.role = user.role >= Const.USER_ROLE.SUPER_ADMIN ? user.role : input.role;

          await trx.update(input).into('users').where('id', user.id);
          continue;
        } else {
          await trx.insert(input).into('users')
          continue;
        }
      }
      // SUCCESS.
      await trx.commit()
      return HelperUtils.responseSuccess(users);
    } catch (e) {
      console.log("ERROR: ", e.message);
      await trx.rollback();
      return HelperUtils.responseErrorInternal('ERROR: bulk update users fail !');
    }
  }
  async updateUserProfile({ request, response }) {
    try {
      const inputs = request.only(['username', 'email', 'wallet_address']);
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
      return response.badRequest(HelperUtils.responseBadRequest('Error: user not exist!'));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: update user fail!'));
    }
  }
  async deleteUser({ request, response }) {
    try {
      const id = request.params.id;
      console.log('delete User with params: ', id);

      const userService = new UserService();
      const admin = await userService.findUser({
        id
      });
      if (admin) {
        admin.status = Const.USER_STATUS.DELETED;
        await admin.delete();
        return HelperUtils.responseSuccess(admin);
      }
      return response.badRequest(HelperUtils.responseBadRequest("Error: Delete non-existing user!"));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: delete user fail!'));
    }
  }
  async getAdminList({ request, response }) {
    try {
      const params = request.only(['limit', 'page']);
      params.only_admin = true
      const searchQuery = request.input('query');
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
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: get user list fail !'));
    }
  }

  async getUserDetail({ params, response }) {
    try {
      const id = params.id;
      const userService = new UserService();
      const admin = await userService.findUser({ id });
      if (admin) {
        return HelperUtils.responseSuccess(admin);
      }
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: user not exist!'));
    } catch (e) {
      console.log(e);
      return response.badRequest(HelperUtils.responseErrorInternal('ERROR: bad request!'));
    }
  }
}

module.exports = UserController