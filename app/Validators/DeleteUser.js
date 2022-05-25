const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const UserService = use('App/Services/UserService');
const HelperUtils=use('App/Common/HelperUtils')
const Const = use('App/Common/Const')
class DeleteUser {
    get rules() { }

    get messages() { }

    get validateAll() {
        return false;
    }
    async authorize() {
        const authRole = this.ctx.auth.user.role;
        const authId = this.ctx.auth.user.id;
        const id = this.ctx.request.params.id;

        const adminService = new UserService();
        const admin = await adminService.findUser({
            id
        });
        if (!admin) {
            this.ctx.response.badRequest(HelperUtils.responseBadRequest("Error: user not exist."))
            return false;
        }
        if (parseInt(authId) === parseInt(admin.id)) {
            // allow delete itself
            return true;
        }
        // only super admin can delete other user.
        if(parseInt(authRole)!==Const.USER_ROLE.SUPER_ADMIN){
            this.ctx.response.unauthorized(HelperUtils.responseBadRequest("Error: Only super-admin is allowed to perform this action."))
            return false;
        }
        // delete other users.
        // user cannot delete user with higher or equal role than his/her role.
        if (parseInt(admin.role) >= parseInt(authRole)) {
            this.ctx.response.unauthorized(HelperUtils.responseBadRequest("Error: you are not allowed to delete this user."))
            return false;
        }
        return true
    }
    async fails(errorMessage) {
        return ErrorFactory.validatorException(errorMessage)
    }
}

module.exports = DeleteUser;
