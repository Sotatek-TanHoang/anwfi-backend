'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ProjectKey extends Model {
    static get table() {
        return 'project_keys';
      }
}

module.exports = ProjectKey;
