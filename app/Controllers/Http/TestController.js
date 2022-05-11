'use strict'
const UserService = use('App/Services/UserService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const JobQueue = use('App/Common/BullScheduler')
class TestController {

    async test({ request }) {

        const inputs = request.only(['time']);
        // convert wallet_address


        return HelperUtils.responseSuccess('ERROR: create user fail !');

    }

}

module.exports = TestController