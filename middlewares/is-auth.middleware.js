const authService = require('../services/auth.service');
const User = require('../models/user.model');
const logger = require('../config/logger');

module.exports = async (req, res, next) => {
  try {
    const token = req.get('Authorization');
    if (!token) {
      const err = new Error('You must pass an authorization token');
      err.statusCode = 401;
      throw err;
    }

    let decoded;

    try {
      decoded = authService.verifyToken(token.replace('Bearer ', ''));
    } catch (error) {
      const err = new Error('You must pass a valid token');
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findOne({
      _id: decoded.id,
      jwtToken: token.replace('Bearer ', ''),
    });

    if (!user) {
      const error = new Error('Unauthorized');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};
