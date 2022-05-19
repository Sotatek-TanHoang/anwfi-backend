'use strict'

const HelperUtils = use('App/Common/HelperUtils');

const TestCalcJob=use('App/Cron-Jobs/CalculateVoteBalanceJob')
class TestController {

    async test() {

    


        const data = {
            proposal_id: 1,
        };

        const options = {
            
            attempts: 2,
            id:Date.now()
        };
        TestCalcJob.add(data, options);
        return HelperUtils.responseSuccess('test');

    }

}

module.exports = TestController