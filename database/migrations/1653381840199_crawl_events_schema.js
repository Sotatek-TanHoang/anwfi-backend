'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CrawlEventsSchema extends Schema {
  up () {
    this.create('crawl_events', (table) => {
      table.increments()
      table.string('sender', 255)
      table.string('account', 255)
      table.integer('role')
      table.integer('is_grant')
      table.integer('blockTime')
      table.string('transaction_hash', 255)

      table.timestamps()
    })
  }

  down () {
    this.drop('crawl_events')
  }
}

module.exports = CrawlEventsSchema
