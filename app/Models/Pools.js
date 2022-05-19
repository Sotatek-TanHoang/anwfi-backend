'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pool extends Model {
    static get table() {
        return 'pools';
    }
}

module.exports = Pool
