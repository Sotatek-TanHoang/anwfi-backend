'use strict'

const Task = use('Task')

class Example extends Task {
  static get schedule () {
    return '* * * * * '
  }

  async handle () {
    // console.log("Schedule: tesst");
  }
}

module.exports = Example
