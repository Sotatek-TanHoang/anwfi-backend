'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const HelperUtils=use('App/Common/HelperUtils')
class Vote extends Model {
    static get table() {
        return 'votes';
    }
    static get hidden () {
        return ['status']
      }
    getBalance(value){
        return HelperUtils.formatDecimal(value)
    }
}

module.exports = Vote
