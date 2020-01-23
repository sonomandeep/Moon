import express from 'express';
import { body } from 'express-validator';

import { Controller } from '../interfaces';
import { AuthServiceInterface } from '../services/auth.service';
import User from '../models/user.model';
import { handleValidation } from '../middlewares';
import RegisterUserDto from '../dtos/user/registerUser.dto';
import LoginUserDto from '../dtos/user/loginUser.dto';
import { InternalServerError } from '../exceptions';

class AuthController implements Controller {
  private path = '/auth';
  public router = express.Router();

  constructor(private authService: AuthServiceInterface) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/register`,
      body('username')
        .trim()
        .isAlphanumeric()
        .isLength({ min: 3, max: 32 })
        .withMessage('The username should have at least 3 characters')
        .custom(async (value) => {
          if (await User.findOne({ username: value })) {
            throw new Error('This username is already taken');
          }
          return true;
        })
        .custom((value) => {
          return (value as string).toLowerCase();
        }),
      body('email')
        .isEmail()
        .withMessage('You should pass a valid email')
        .normalizeEmail()
        .custom(async (value) => {
          if (await User.findOne({ email: value })) {
            throw new Error('This email address is already taken');
          }
          return true;
        }),
      body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('The password should have at least 6 characters')
        .isAlphanumeric()
        .withMessage('The password should have only alphanumerical characters'),
      handleValidation,
      this.register,
    );
    this.router.post(
      `${this.path}/login`,
      body('username')
        .trim()
        .isLength({ min: 3, max: 32 })
        .withMessage('The username should have at least 3 characters')
        .isAlphanumeric()
        .custom((value) => {
          return (value as string).toLowerCase();
        }),
      body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('The password should have at least 6 characters')
        .isAlphanumeric()
        .withMessage('The password should have only alphanumerical characters'),
      handleValidation,
      this.login,
    );
  }

  private register = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const registerUserDto: RegisterUserDto = req.body;

    try {
      const result = await this.authService.register(registerUserDto);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  };

  private login = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const loginUserDto: LoginUserDto = req.body;

    try {
      const result = await this.authService.login(loginUserDto);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  };
}

export default AuthController;
