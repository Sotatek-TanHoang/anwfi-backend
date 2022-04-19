'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Subscribe extends Model {
    static get table() {
        return 'subscribes';
      }
}

module.exports = Subscribe;
