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
      table.tinyint('status', '0').notNullable().default('0');
      table.tinyint('role').notNullable().default(Const.USER_ROLE.ICO_OWNER);
      table.tinyint('type').notNullable().default(Const.USER_TYPE.REGULAR);
      table.string('wallet_address').notNullable();
      table.string('firstname', 255).nullable();
      table.string('lastname', 255).nullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
