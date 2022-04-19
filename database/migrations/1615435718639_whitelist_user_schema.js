'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Const = use('App/Common/Const');

class WhitelistUserSchema extends Schema {
  up () {
    this.create('whitelist_users', (table) => {
      table.increments();
      table.string('email', 255).nullable();
      table.string('wallet_address', 255).notNullable();
      table.integer('project_id').unsigned().notNullable();
      table.boolean('status').defaultTo(true);
      table.unique(['wallet_address', 'project_id']);
      table.timestamps();
    })
  }

  down () {
    this.drop('whitelist_users')
  }
}

module.exports = WhitelistUserSchema
