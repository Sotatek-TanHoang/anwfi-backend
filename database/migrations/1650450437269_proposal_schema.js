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
      table.datetime('start_time').nullable();
      table.datetime('end_time').nullable();
      table.decimal('quorum',65,0).nullable().defaultTo(0); // min number awfi of all voted holding  to acept proposal 
      table.decimal('min_anwfi',65,0).nullable().defaultTo(0);// min number awfi of user to vote aception  
      table.integer('pass_percentage', 6);// min percent of yes vote to acept proposal
      table.tinyint('proposal_status').notNullable().default(Const.PROPOSAL_STATUS.CREATED);
      // history tracking
      table.datetime('tmp_created').nullable();
      table.datetime('tmp_active').nullable();
      table.datetime('tmp_result').nullable();
      table.datetime('tmp_queue').nullable();
      table.datetime('tmp_executed').nullable();
      table.timestamps();
    })
  }

  down () {
    this.drop('proposals')
  }
}

module.exports = ProposalSchema
