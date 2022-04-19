/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class AirDrops extends Model {
  static get table() {
    return 'airdrops';
  }

}

module.exports = AirDrops;
