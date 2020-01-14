const expressValidator = require('express-validator');

module.exports = (req, res, next) => {
  const errors = expressValidator.validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation error');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  next();
};
