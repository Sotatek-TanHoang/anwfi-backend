const ErrorFactory = use('App/Common/ErrorFactory');
const HelperUtils=use('App/Common/HelperUtils')
const ProposalService = use("App/Services/ProposalService")
const Const = use('App/Common/Const')
const ForbiddenException = use("App/Exceptions/ForbiddenException")

const moment = require('moment')
class CheckVote {
    get rules() {

        return {
            'stake_token':'string|required',
             'name':'string|required', 
             'alloc_point':'number:required', 
             'start_block':'integer|required',
             'bonus_multiplier':'number|required',
             'bonus_end_block':'number|required',
             'is_lp_token':'boolean|required'
        };
    }
    get messages() {
        return {};
    }

    get validateAll() {
        return true;
    }

    async fails(errorMessage) {
        return ErrorFactory.validatorException(errorMessage)
    }
}

module.exports = CheckVote;