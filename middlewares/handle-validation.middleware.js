const handleValidation = (req, res, next) => {
  const errors = expressValidator.validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation error');
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    throw error;
  }
};
