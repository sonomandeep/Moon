import { Request, Response, NextFunction } from 'express';

import * as authService from '../services/auth.service';
import User from '../models/user.model';
import logger from '../config/logger';

export default async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.get('Authorization');
    if (!token) {
      const err = new Error('You must pass an authorization token');
      (err as any).statusCode = 401;
      throw err;
    }

    let decoded;

    try {
      decoded = authService.verifyToken(token.replace('Bearer ', ''));
    } catch (error) {
      const err = new Error('You must pass a valid token');
      (err as any).statusCode = 401;
      throw err;
    }

    const user = await User.findOne({
      _id: (decoded as any).id,
      jwtToken: token.replace('Bearer ', ''),
    });

    if (!user) {
      const error = new Error('Unauthorized');
      (error as any).statusCode = 401;
      throw error;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};
