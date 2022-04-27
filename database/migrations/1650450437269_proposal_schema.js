'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Const = use('App/Common/Const');

class ProposalSchema extends Schema {
  up () {
    this.create('proposals', (table) => {
      table.increments()
      table.string('wallet_address', 255).notNullable();
      table.string('proposal_type').notNullable().default(Const.PROPOSAL_TYPE.OFFCHAIN_PROPOSAL);
      table.decimal('current_value', 4);
      table.decimal('new_value', 4);
      table.string('description');
      table.boolean('is_display').notNullable().defaultTo(0); // Display in page or not
      table.boolean('is_deploy').notNullable().defaultTo(0);
      table.string('start_time').nullable();
      table.string('end_time').nullable();
      table.decimal('quorum').nullable().defaultTo(0); // min number awfi of all voted holding  to acept proposal 
      table.decimal('min_anwfi').nullable().defaultTo(0);// min number awfi of user to vote aception  
      table.decimal('pass_percentage', 4);// min percent of yes vote to acept proposal
      table.tinyint('proposal_status').notNullable().default(Const.PROPOSAL_STATUS.CREATED);
      table.timestamps()
    })
  }

  down () {
    this.drop('proposals')
  }
}

module.exports = ProposalSchema
