'use strict'

const ErrorFactory = use('App/Common/ErrorFactory');
const AdminModel = use('App/Models/User');
const PasswordResetModel = use('App/Models/PasswordReset');
const Const = use('App/Common/Const');

class AdminService {

  buildQueryBuilder(params) {
    let builder = AdminModel.query();
    if (params.id) {
      builder = builder.where('id', params.id);
    }
    if (params.username) {
      builder = builder.where('username', params.username);
    }
    if (params.email) {
      builder = builder.where('email', params.email);
    }
    if (params.signature) {
      builder = builder.where('signature', params.signature);
    }
    if (params.wallet_address) {
      builder = builder.where('wallet_address', params.wallet_address);
    }
    if (params.type) {
      builder = builder.where('type', params.type);
    }
    if (params.role) {
      builder = builder.where('role', params.role);
    }
    if (params.confirmation_token) {
      builder = builder.where('confirmation_token', params.confirmation_token);
    }
    if (params.status !== undefined) {
      builder = builder.where('status', params.status);
    } else {
      builder = builder.where('status', Const.USER_STATUS.ACTIVE);
    }

    // get number of projects that each admin created
    // builder.withCount('projects as projects_created');
    return builder;
  }

  buildSearchQuery(query, searchQuery) {
    return query.where((q) => {
      q.where('email', 'like', `%${searchQuery}%`)
        .orWhere('wallet_address', 'like', `%${searchQuery}%`)
        .orWhere('lastname', 'like', `%${searchQuery}%`)
        .orWhere('firstname', 'like', `%${searchQuery}%`);
    })
  }

  async findUser(params) {
    let builder = this.buildQueryBuilder(params);
    return await builder.first();
  }

  async checkToken(token, role) {
    const tokenReset = await PasswordResetModel.query().where('token', token).where('role', role).first();
    if (tokenReset) {
      const timeExpired = tokenReset.time_expired;
      if (Date.now() < timeExpired) {
        return tokenReset;
      }
      ErrorFactory.badRequest('Forgot password link has expired');
    } else {
      ErrorFactory.notFound('Token is not found!');
    }
  }

}

module.exports = AdminService