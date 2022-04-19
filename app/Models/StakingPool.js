'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class StakingProject extends Model {
  static get table() {
    return 'staking_projects'
  }
}

module.exports = StakingProject
