'use strict'

const Task = use('Task')

class ScheduleIt extends Task {
  static get schedule () {
    return '* * * * * '
  }

  async handle () {
    console.log('Task ScheduleIt handle');
  }
}

module.exports = ScheduleIt
