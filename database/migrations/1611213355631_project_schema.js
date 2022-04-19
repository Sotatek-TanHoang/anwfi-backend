'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Const = use('App/Common/Const');

class ProjectSchema extends Schema {
  up () {
    this.create('projects', (table) => {
      table.increments()
      table.string('title')
      table.string('token_address')
      table.string('registed_by')
      table.string('project_hash')
      table.string('project_contract_address')
      table.string('start_time')
      table.string('finish_time')
      table.string('token_conversion_rate')
      table.string('ether_conversion_rate')
      table.boolean('is_pause').default(0);
      table.string('transaction_hash')
      table
        .tinyint('blockchain_status')
        .notNullable()
        .defaultTo(Const.OPERATORS_BLOCKCHAIN_ADDRESS_STATUS.REGISTRATION_WAITING_TX_FROM_CLIENT);
      table.string('deleted_tx', 100).nullable();
      table.string('deleted_from', 100).nullable();
      table.string('project_name')
      table.string('token_symbol')
      table.text('project_information')

      // alter table
      table.string('token_icon').nullable();
      table.string('receive_address').nullable();
      table.string('token_name').nullable();
      table.string('total_raise_amount').nullable().defaultTo(0);

      table.string('announce_time').nullable();
      table.integer('buy_type').notNullable().defaultTo(1);
      table.integer('project_type').notNullable().defaultTo(1);
      table.integer('distribution_method').nullable()
      table.boolean('is_deploy').notNullable().defaultTo(0);
      table.boolean('is_display').notNullable().defaultTo(0); // Display in dashboard
      table.boolean('is_update_show_launchpad').notNullable().defaultTo(0); // has update project
      table.string('website').nullable();
      table.string('distribute_time').nullable();
      table.string('project_status').nullable();
      table.string('snapshot_time').nullable();
      table.string('min_stake').nullable();
      table.string('max_stake').nullable();
      table.string('airdrop_fix_amount').nullable();
      table.string('whitelist_hardcap').nullable();
      table.string('other_hardcap').nullable();
      table.string('whitelist_trigger').nullable();
      table.string('other_trigger').nullable();
      table.string('whitelist_untrigger').nullable();
      table.string('other_untrigger').nullable();
      table.string('whitepaper_link').nullable();
      table.string('twitter_link').nullable();
      table.string('telegram_link').nullable();
      table.string('medium_link').nullable();
      table.integer('status_deploy').notNullable().defaultTo(0);
      table.integer('is_priority').notNullable().defaultTo(0);
      table.timestamps()
    })
  }

  down () {
    this.drop('projects')
  }
}

module.exports = ProjectSchema
