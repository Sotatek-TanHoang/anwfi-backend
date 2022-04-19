'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AirdropsSchema extends Schema {
  up () {
    this.create('airdrops', (table) => {
      table.increments()
      table.string('wallet_address', 255).notNullable();
      table.integer('project_id').unsigned().notNullable();
      table.string('amount');
      table.string('allocation').nullable();
      table.boolean('status').defaultTo(false);
      table.string('transaction_hash');
      table.unique(['wallet_address', 'project_id']);
      table.timestamps()
    })
  }

  down () {
    this.drop('airdrops')
  }
}

module.exports = AirdropsSchema
