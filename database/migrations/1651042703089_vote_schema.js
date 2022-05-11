'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class VoteSchema extends Schema {
  up () {
    this.create('votes', (table) => {
      table.increments()
      table.string('wallet_address', 255).notNullable();
      table.integer('proposal_id').notNullable();
      table.bool('vote').notNullable();
      table.decimal("balance",65,10).notNullable();
      table.bool('status').notNullable().defaultTo(false)
      table.timestamps();
      table.unique(['wallet_address','proposal_id']);
    })
  }

  down () {
    this.drop('votes')
  }
}

module.exports = VoteSchema
