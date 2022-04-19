'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SubscribesSchema extends Schema {
  up () {
    this.create('subscribes', (table) => {
      table.increments()
      table.string('email').notNullable()
      table.timestamps()

    })
  }

  down () {
    this.drop('subscribes')
  }
}

module.exports = SubscribesSchema
