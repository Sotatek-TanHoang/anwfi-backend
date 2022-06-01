'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pool extends Model {
    static get table() {
        return 'pools';
    }
    token_info() {
        return this.hasOne('App/Models/PoolTokenInfo', 'stake_token', 'token_address')
      }
}

module.exports = Pool
