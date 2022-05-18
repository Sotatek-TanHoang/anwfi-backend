'use strict'

const HelperUtils = use('App/Common/HelperUtils');

const UpdateVoteBalanceJob=use('App/Cron-Jobs/UpdateVoteBalanceJob')
class TestController {

    async test() {

    


        const data = {
            proposal_id: 1,
        };

        const options = {
            
            attempts: 2,
            id:Date.now()
        };
        UpdateVoteBalanceJob.add(data, options);
        return HelperUtils.responseSuccess('test');

    }

}

module.exports = TestController