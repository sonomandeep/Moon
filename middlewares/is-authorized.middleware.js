const logger = require('../config/logger');

module.exports = (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      error.statusCode = 400;
      throw error;
    }

    if (id !== req.user._id) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};
