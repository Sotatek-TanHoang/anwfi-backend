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
      table.string('name').notNullable();
      table.decimal('current_value',20,10).notNullable();
      table.decimal('new_value',20,10).notNullable();
      table.longText('description').nullable().defaultTo('');
      table.boolean('is_display').notNullable().defaultTo(0); // Display in page or not
      table.boolean('is_deploy').notNullable().defaultTo(0);
      table.datetime('start_time').notNullable()
      table.datetime('end_time').notNullable()
      table.decimal('min_anwfi',65,20).notNullable().defaultTo(0);// min number awfi of user to vote aception  
      table.integer('quorum',6).notNullable().defaultTo(0); // min percent awfi of all voted holding  to acept proposal vd: 10000 for 100.00% , 10 for 0.1 %
      table.integer('pass_percentage', 6).notNullable();// min percent of yes vote to acept proposal
      table.tinyint('proposal_status').notNullable().default(Const.PROPOSAL_STATUS.CREATED);
      table.string('proposal_hash');
      table.string('ipfs_link');// ipfs link that proposal up to( when finish  vote and count vote)

     // vote tracking
     table.decimal('up_vote',20,0).notNullable().defaultTo(0);
     table.decimal('down_vote',20,0).notNullable().defaultTo(0);
     table.decimal('up_vote_anwfi',60,18).notNullable().defaultTo(0);
     table.decimal('down_vote_anwfi',60,18).notNullable().defaultTo(0);
     // delayed above values
     table.decimal('d_up_vote',20,0).notNullable().defaultTo(0);
     table.decimal('d_down_vote',20,0).notNullable().defaultTo(0);
     table.decimal('d_up_vote_anwfi',60,18).notNullable().defaultTo(0);
     table.decimal('d_down_vote_anwfi',60,18).notNullable().defaultTo(0);
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
