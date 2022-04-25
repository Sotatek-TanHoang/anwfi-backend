const ErrorFactory = use('App/Common/ErrorFactory');
const ForbiddenException = use("App/Exceptions/ForbiddenException")
const AdminService = use('App/Services/AdminService');

class DeleteUser {
    get rules() {
        return {
        };
    }

    get messages() {
        return {
            'email.email': "You must provide a valid email"

        };
    }

    get validateAll() {
        return true;
    }
    async authorize() {
        const authRole = this.ctx.auth.user.role;
        const id = this.ctx.request.params.id;

        const adminService = new AdminService();
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
        return true
    }
    async fails(errorMessage) {
        return ErrorFactory.validatorException(errorMessage)
    }
}

module.exports = DeleteUser;
