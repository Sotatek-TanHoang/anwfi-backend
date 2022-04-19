'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CrawlProjectStatusSchema extends Schema {
  up () {
    this.create('crawl_project_status', (table) => {
      table.increments()
      table.string('contract_name').notNullable()
      table.string('contract_address').nullable()
      table.integer('block_number').unsigned().notNullable()
      table.bigInteger('created_at').unsigned().notNullable()
      table.bigInteger('updated_at').unsigned().notNullable()
    })
  }

  down () {
    this.drop('crawl_project_status')
  }
}

module.exports = CrawlProjectStatusSchema
