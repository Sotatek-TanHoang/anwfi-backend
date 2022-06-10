'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CrawlPoolEventsSchema extends Schema {
  up () {
    this.create('crawl_pool_events', (table) => {
      table.increments()
      table.string('wallet_address', 255)
      table.integer('pool_id')// is pool index n pool table( pool index is pool id of this pool in Smart Contract )
      table.decimal("amount",40,20)
      table.string('event', 255)
      // table.integer('is_grant')
      table.integer('blockTime')
      table.string('transaction_hash', 255)

      table.timestamps()
    })
  }

  down () {
    this.drop('crawl_pool_events')
  }
}

module.exports = CrawlPoolEventsSchema
