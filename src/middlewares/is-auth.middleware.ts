import { Request, Response, NextFunction } from 'express';

import authService from '../services/auth.service';
import User from '../models/user.model';
import { UnauthenticatedException } from '../exceptions';
import DecodedJwtToken from '../interfaces/jwtToken';
import RequestWithUser from '../interfaces/requestWithUser';

export default async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.get('Authorization');
  if (!token) {
    return next(
      new UnauthenticatedException('You must pass an authorization token'),
    );
  }

  let decoded: string | object;
  try {
    decoded = authService.verifyToken(token.replace('Bearer ', ''));
  } catch (error) {
    return next(
      new UnauthenticatedException('You must pass a valid authorization token'),
    );
  }

  const user = await User.findOne({
    _id: (decoded as DecodedJwtToken).id,
    jwtToken: token.replace('Bearer ', ''),
  });

  if (!user) {
    return next(new UnauthenticatedException());
  }

  (req as RequestWithUser).user = user._id;
  return next();
};
