'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PoolTokenInfosSchema extends Schema {
  up () {
    this.create('pool_token_infos', (table) => {
      table.increments()
      table.boolean('isLpToken');
      table.timestamps()
    })
  }

  down () {
    this.drop('pool_token_infos')
  }
}

module.exports = PoolTokenInfosSchema
