'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PoolUserStake extends Model {
    static get table() {
        return 'pool_user_stakes';
    }
}

module.exports = PoolUserStake
