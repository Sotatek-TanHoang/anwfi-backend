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
      table.timestamps();
      table.unique(['wallet_address']);
    })
  }

  down () {
    this.drop('votes')
  }
}

module.exports = VoteSchema
