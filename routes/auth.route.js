const Router = require('express').Router();
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const handleValidation = require('../middlewares/handle-validation.middleware');
const User = require('../models/user.model');

Router.post(
  '/register',
  body('username')
    .trim()
    .isLength({ min: 3 })
    .isAlphanumeric()
    .custom(async (value, { req }) => {
      if (await User.findOne({ username: value })) {
        throw new Error('This username is already taken');
      }
      return true;
    }),
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom(async (value, { req }) => {
      if (await User.findOne({ email: value })) {
        throw new Error('This email address is already taken');
      }
      return true;
    }),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .isAlphanumeric(),
  handleValidation,
  authController.register,
);

Router.post(
  '/login',
  body('username')
    .trim()
    .isLength({ min: 3 })
    .isAlphanumeric(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .isAlphanumeric(),
  handleValidation,
  authController.login,
);

module.exports = Router;
