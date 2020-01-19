import express from 'express';
import { body } from 'express-validator';

import * as authController from '../controllers/auth.controller.js';
import handleValidation from '../middlewares/handle-validation.middleware';
import User from '../models/user.model';

const Router = express.Router();

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

export default Router;
