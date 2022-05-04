'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Proposal extends Model {
  static get table() {
    return 'proposals';
  }
  votes(){
    return this.hasMany('App/Models/Vote','id','proposal_id')
  }

}

module.exports=Proposal