const { LogicalException } = require('@adonisjs/generic-exceptions');

class BadRequestException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  handle(error, { response }) {
    return response.json({
      status: 400,
      data: null,
      message: error.message || 'ERROR: Bad request!'
    })

    // response.forbidden({ error: error.message });
  }
}

module.exports = BadRequestException;
