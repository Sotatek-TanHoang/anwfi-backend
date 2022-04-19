'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class WhitelistUser extends Model {
  static get table() {
    return 'whitelist_users';
  }

}

module.exports = WhitelistUser
