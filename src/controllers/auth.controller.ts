import express from 'express';
import { body } from 'express-validator';

import { Controller } from '../interfaces';
import { AuthServiceInterface } from '../services/auth.service';
import User from '../models/user.model';
import { handleValidation } from '../middlewares';

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
  }

  private register = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const registerUserDto = req.body;

    try {
      const result = await this.authService.register(registerUserDto);
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  };
}

export default AuthController;

// import { Request, Response, NextFunction } from 'express';
// import bcrypt from 'bcryptjs';

// import User from '../models/user.model';
// import authService from '../services/auth.service';
// import logger from '../config/logger';

// export const register = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { username, password, email } = req.body;

//   return res.json({
//     id: savedUser._id,
//     username: savedUser.username,
//     email: savedUser.email,
//   });
// };

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { username, password } = req.body;

//     const user = await User.findOne({ username });

//     if (!user) {
//       const error = new Error('User not found');
//       (error as any).statusCode = 404;
//       throw error;
//     }

//     const passwordCheckResult = await bcrypt.compare(password, user.password);

//     if (!passwordCheckResult) {
//       const error = new Error(
//         'This username/password combination does not exist',
//       );
//       (error as any).statusCode = 401;
//       throw error;
//     }

//     const token = authService.generateToken(user);

//     user.jwtToken = token;
//     user.save();

//     return res.json({
//       jwtToken: user.jwtToken,
//       user: { id: user._id, username: user.username, email: user.email },
//     });
//   } catch (err) {
//     logger.log('error', err);
//     next(err);
//     throw err;
//   }
// };
