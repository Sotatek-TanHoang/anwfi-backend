'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Proposal extends Model {
  static get table() {
    return 'proposals';
  }
  static get hidden() {
    return ["tmp_created",
      "tmp_active",
      "tmp_result",
      "tmp_queue",
      "tmp_executed",
      "created_at",
      "updated_at", 
      'is_display',
      'is_deploy'
    ]
  }
  votes() {
    return this.hasMany('App/Models/Vote', 'id', 'proposal_id')
  }

}

module.exports = Proposal