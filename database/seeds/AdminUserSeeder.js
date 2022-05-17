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
const ProposalModel = use('App/Models/Proposal')
const Const = use('App/Common/Const')
class AdminUserSeeder {
  async run() {
    const UserAdd = {
      wallet_address: "0x9f1F81479c696E358D790d0a848B41e0DED698e0",
      username: "sotatek Admin"
    }
    const ProposalAdd = {
      "proposal_type": "swap fee",
      "current_value": "0.24",
      "new_value": "0.34",
      "description": "some description",
      "start_time": "2022-10-05 21:22:50",
      "end_time": "2022-10-05 21:22:50",
      "quorum": "10000000000",
      "min_anwfi": "10000000000",
      "pass_percentage": 0,
      name: "sample",
      wallet_address: '0x9f1F81479c696E358D790d0a848B41e0DED698e0'
    }

    let adminUser = new AdminUser();
    adminUser.wallet_address = UserAdd.wallet_address;
    adminUser.username = UserAdd.username;
    adminUser.role = Const.USER_ROLE.SUPER_ADMIN
    await adminUser.save();

    let proposal = new ProposalModel()
    proposal.fill(ProposalAdd)
    await proposal.save()
  }
}

module.exports = AdminUserSeeder
