'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StakingProjectSchema extends Schema {
  up () {
    this.create('staking_projects', (table) => {
      table.increments()
      table.string('wallet_address', 255);
      table.integer('project_id');
      table.string('stake_amount').nullable();
      table.string('allocation').nullable();
      table.boolean('status').defaultTo(false);
      table.string('transaction_hash');
      table.unique(['wallet_address', 'project_id']);
      table.timestamps()
    })
  }

  down () {
    this.drop('staking_projects')
  }
}

module.exports = StakingProjectSchema
