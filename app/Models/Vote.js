'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Vote extends Model {
    static get table() {
        return 'votes';
    }
}

module.exports = Vote
