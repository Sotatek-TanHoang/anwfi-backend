const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const UserService = use('App/Services/UserService');

class DeleteUser {
    get rules() {}

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
            throw new ForbiddenException("Error: user not exist.")
        }
        // user cannot delete user with higher role than his/her role.
        if (parseInt(admin.role) > parseInt(authRole)) {
            throw new ForbiddenException("Error: you are not allowed to delete this user.")
        }
        if (parseInt(admin.id) === parseInt(authId)) {
            throw new ForbiddenException("Error: you are not allowed to delete yourself.")
        }
        return true
    }
    async fails(errorMessage) {
        return ErrorFactory.validatorException(errorMessage)
    }
}

module.exports = DeleteUser;
