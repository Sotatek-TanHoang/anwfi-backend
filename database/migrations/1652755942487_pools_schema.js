'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PoolsSchema extends Schema {
  up () {
    this.create('pools', (table) => {
      table.increments()
      table.string('stake_token', 255).notNullable(); //address token 
      // table.string('proposal_type').notNullable().default(Const.PROPOSAL_TYPE.OFFCHAIN_PROPOSAL);
      table.integer('pool_index'); // index in pool length  from Smart Contract
      table.decimal('total_stake',40);
      table.decimal('alloc_point',4);
      table.integer('last_reward_block');
      table.integer('acc_reward_per_share');
      table.integer('bonus_end_block');
      table.integer('start_block');
      table.integer('min_stake_period');
      table.integer('bonus_multiplier');
      table.integer('reward_amount');
      table.decimal('liquidity',65);
      table.boolean('is_lp_token');
      table.timestamps()

    })
  }

  down () {
    this.drop('pools')
  }
}

module.exports = PoolsSchema
