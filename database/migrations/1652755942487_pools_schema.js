'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PoolsSchema extends Schema {
  up () {
    this.create('pools', (table) => {
      table.increments()
      table.string('stakeToken', 255).notNullable(); //address token 
      // table.string('proposal_type').notNullable().default(Const.PROPOSAL_TYPE.OFFCHAIN_PROPOSAL);
      table.decimal('totalStake',18);
      table.decimal('allocPoint',4);
      table.integer('lastRewardBlock');
      table.integer('accRewardPerShare');
      table.integer('bonusEndBlock');
      table.integer('startBlock');
      table.integer('minStakePeriod');
      table.integer('bonusMultiplier');
      table.integer('rewardAmount');
      table.boolean('isLpToken');
      table.timestamps()

    })
  }

  down () {
    this.drop('pools')
  }
}

module.exports = PoolsSchema
