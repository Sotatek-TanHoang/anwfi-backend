'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PoolsSchema extends Schema {
  up () {
    this.create('pools', (table) => {
      table.increments()
      table.string('stake_token', 255).notNullable(); //address token 
      table.string('name', 255); //name pool = symbol token stake or pair token 
      table.integer('pool_index'); // index in pool length  from Smart Contract
      table.decimal('total_stake',40);// total token stake in this pool
      table.decimal('alloc_point',4);// 
      table.integer('last_reward_block');
      table.integer('acc_reward_per_share');
      table.integer('bonus_end_block');//  time when bonus_multiplier 
      table.integer('start_block'); 
      table.integer('min_stake_period');// default =0
      table.integer('bonus_multiplier'); 
      table.integer('reward_amount');// default=0 (because AWN token is mintable)
      table.integer('status').notNullable().defaultTo(0);// defaut is create
      table.decimal('liquidity',65);
      table.boolean('is_lp_token');
      table.boolean('is_display').notNullable().defaultTo(0); // Display in page or not
      table.timestamps()
      table.unique(['stake_token']);


    })
  }

  down () {
    this.drop('pools')
  }
}

module.exports = PoolsSchema
