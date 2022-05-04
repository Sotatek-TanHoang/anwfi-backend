'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const AdminUser = use('App/Models/User')
const Const=use('App/Common/Const')
class AdminUserSeeder {
  async run () {
      const UserAdd = {
        wallet_address: "0x9f1F81479c696E358D790d0a848B41e0DED698e0",
        username: "sotatek Admin"
      }

      let adminUser = new AdminUser();
      adminUser.wallet_address = UserAdd.wallet_address;
      adminUser.username = UserAdd.username;
      adminUser.role=Const.USER_ROLE.SUPER_ADMIN
      await adminUser.save();
  }
}

module.exports = AdminUserSeeder
