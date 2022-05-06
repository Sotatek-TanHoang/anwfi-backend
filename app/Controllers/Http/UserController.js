'use strict'
const UserService = use('App/Services/UserService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const Database = use('Database')

class UserController {

  async createUser({ request }) {
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
        return HelperUtils.responseBadRequest('Wallet is used');
      }

      const user = new UserModel();
      user.fill(inputs);
      user.status = Const.USER_STATUS.ACTIVE;
      await user.save();

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

      // const bulkUsers=await UserModel.createMany(newUsers)
      const bulk = await Promise.all(users.map(async (input) => {
        try {
          await UserModel.create(input,trx);      
          return { success: true, data: input, message: "user created" }
        } catch (e) {
          return {success:false,data:input,message:e.message}
        }
      }))
      if(bulk.some(result=>!result.success)){
        await trx.rollback();
        return HelperUtils.responseSuccess({result:bulk},"ERROR: some users are failed to create.");
      }
      await trx.commit()
      return HelperUtils.responseSuccess({result:bulk,message:"success."});
    } catch (e) {
      console.log(e.message);
      await trx.rollback();
      return HelperUtils.responseErrorInternal('ERROR: bulk create users fail !');
    }
  }
  async bulkUpdateUser({request}){
    // begin transaction.
    const trx = await Database.beginTransaction()
    try {
      const { users } = request.only(['users']);

      const bulk = await Promise.all(users.map(async (input) => {
        try {
          await UserModel.create(input,trx);      
          return { success: true, data: input, message: "user created" }
        } catch (e) {
          return {success:false,data:input,message:e.message}
        }
      }))
      if(bulk.some(result=>result.error)){
        await trx.rollback();
        return HelperUtils.responseSuccess({result:bulk},"ERROR: some users are failed to update.");
      }
      await trx.commit()
      return HelperUtils.responseSuccess({result:bulk});
    } catch (e) {
      console.log(e.message);
      await trx.rollback();
      return HelperUtils.responseErrorInternal('ERROR: bulk update users fail !');
    }
  }
  async updateUserProfile({ request }) {
    try {
      const inputs = request.only(['role', 'username', 'email', 'wallet_address']);
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