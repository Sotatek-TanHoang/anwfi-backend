'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PoolTokenInfo extends Model {
    static get table() {
        return 'pool_token_infos';
    }
    // if val==="" adonis return null.
    getLogoToken1(val) {
        return val ?? ""
    }
    getLogoToken2(val) {
        return val ?? ""
    }
}

module.exports = PoolTokenInfo
