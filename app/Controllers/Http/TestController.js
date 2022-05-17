'use strict'
const UserService = use('App/Services/UserService');
const UserModel = use('App/Models/User');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const JobQueue = use('App/Common/BullScheduler')
class TestController {

    async test({ request }) {

        const inputs = request.only(['time']);


        const data = {
            email: 'userid@domain.com',
            time:Date.now()
        };

        const options = {
            delay: 3000, // 1 min in ms
            attempts: 2,
           
            jobId:`unique-${Date.now()/3000}`
        };
        // 2. Adding a Job to the Queue
        // JobQueue.removeJobs(options.jobId);
        JobQueue.add(data, options);
        return HelperUtils.responseSuccess('test');

    }

}

module.exports = TestController