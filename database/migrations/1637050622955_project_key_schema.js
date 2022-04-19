'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectKeySchema extends Schema {
  up () {
    this.create('project_keys', (table) => {
      table.increments()
      table.integer('project_id').unsigned().notNullable();
      table.string('key').nullable();
      table.timestamps()
    })
  }

  down () {
    this.drop('project_keys')
  }
}

module.exports = ProjectKeySchema
