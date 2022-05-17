'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PoolTokenInfo extends Model {
    static get table() {
        return 'pool_token_infos';
    }
}

module.exports = PoolTokenInfo
