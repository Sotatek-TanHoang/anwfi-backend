'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Proposal extends Model {
  static get table() {
    return 'proposals';
  }

}

module.exports=Proposal