'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Const = use('App/Common/Const');

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('username', 255).nullable();
      table.string('email', 255).nullable();
      table.boolean('is_active').notNullable().defaultTo(0);
      table.tinyint('status', '1').notNullable().default('1');
      table.tinyint('role').notNullable();
      table.tinyint('type').notNullable().default(Const.USER_TYPE.REGULAR);
      table.string('wallet_address').notNullable();
      table.string('firstname', 255).nullable();
      table.string('lastname', 255).nullable();
      table.unique(['wallet_address']);
      table.timestamps();
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
