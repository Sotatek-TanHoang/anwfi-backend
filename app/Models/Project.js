/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Project extends Model {
  static get table() {
    return 'projects';
  }

  transaction() {
    return this.hasMany('App/Models/Transaction', 'id', 'campaign_id');
  }

  whitelistUsers() {
    return this.hasMany('App/Models/WhitelistUser')
  }

}

module.exports = Project;
