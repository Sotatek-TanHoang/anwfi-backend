const ErrorFactory = use('App/Common/ErrorFactory');
class CheckVote {
    get rules() {

        return {
            vote: "boolean|required"
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
