'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StakingLogsSchema extends Schema {
  up () {
    this.create('staking_logs', (table) => {
      table.increments()
      table.string('wallet_address', 255).notNullable();
      table.integer('project_id').unsigned().notNullable();
      table.string('stake_amount').nullable();
      table.string('transaction_hash');
      table.timestamps()
    })
  }

  down () {
    this.drop('staking_logs')
  }
}

module.exports = StakingLogsSchema
