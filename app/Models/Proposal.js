'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const HelperUtils=use('App/Common/HelperUtils')
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
      'is_deploy',
      'up_vote',
      'down_vote',
      "up_vote_anwfi",
      'down_vote_anwfi'
    ]
  }
  votes() {
    return this.hasMany('App/Models/Vote', 'id', 'proposal_id')
  }
  getQuorum(val){
    return HelperUtils.formatDecimal(val)
  }
  getMinAnwfi(val){
    return HelperUtils.formatDecimal(val)
  }
  getCurrentValue(val){
    return HelperUtils.formatDecimal(val)
  }
  getNewValue(val){
    return HelperUtils.formatDecimal(val)
  }
}

module.exports = Proposal