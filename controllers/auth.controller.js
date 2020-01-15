const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const authService = require('../services/auth.service');
const logger = require('../config/logger');

exports.register = async (req, res, next) => {
  const { username, password, email } = req.body;

  const hashedPassword = await authService.hashPassword(password);
  const user = new User({ username, password: hashedPassword, email });

  const savedUser = await user.save();

  return res.json({
    id: savedUser._id,
    username: savedUser.username,
    email: savedUser.email,
  });
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const passwordCheckResult = await bcrypt.compare(password, user.password);

    if (!passwordCheckResult) {
      const error = new Error(
        'This username/password combination does not exist',
      );
      error.statusCode = 401;
      throw error;
    }

    const token = authService.generateToken(user);

    user.jwtToken = token;
    user.save();

    return res.json({
      jwtToken: user.jwtToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    logger.log('error', err);
    next(err);
    throw err;
  }
};
