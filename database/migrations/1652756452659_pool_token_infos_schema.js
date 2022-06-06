'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PoolTokenInfosSchema extends Schema {
  up () {
    this.create('pool_token_infos', (table) => {
      table.increments()
      table.string('token_address', 255).notNullable(); //address token 
      table.boolean('is_lp_token');//check normal token or lp token
      table.string('kLast', 255)
      table.string('price0_cumulative_last', 255)
      table.string('price1_cumulative_last', 255)
      table.string('token0', 255)
      table.decimal('amount_token0',65); // total amount token 0 add to this pool
      table.string('token1', 255)
      table.decimal('amount_token1',65);// total amount token 0 add to this pool
      table.string('domain_separator', 255)
      table.integer('minimum_liquidity')
      table.string('permit_typehash', 255)
      table.integer('decimals')
      table.string('factory', 255)
      table.string('name', 255)
      table.string('symbol', 255)
      table.string('total_supply')
      table.string('price', 255)
      table.datetime('last_updated')
      table.longtext('logo_url')
      table.timestamps()
    })
  }

  down () {
    this.drop('pool_token_infos')
  }
}

module.exports = PoolTokenInfosSchema
