'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PoolUserStakesSchema extends Schema {
  up () {
    this.create('pool_user_stakes', (table) => {
      table.increments()
      table.string('wallet_address', 255)
      table.integer('pool_id')
      table.decimal("amount",40,20)
      table.decimal("reward",40,20)
      table.timestamps()
    })
  }

  down () {
    this.drop('pool_user_stakes')
  }
}

module.exports = PoolUserStakesSchema
