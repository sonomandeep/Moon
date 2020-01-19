import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/user.model';
import * as authService from '../services/auth.service';
import logger from '../config/logger';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }

    const passwordCheckResult = await bcrypt.compare(password, user.password);

    if (!passwordCheckResult) {
      const error = new Error(
        'This username/password combination does not exist',
      );
      (error as any).statusCode = 401;
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
