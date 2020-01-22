import { Request, Response, NextFunction } from 'express';

import { BadRequestException, UnauthorizedException } from '../exceptions';
import { RequestWithUser } from '../interfaces/requests';

export default (req: Request, res: Response, next: NextFunction): void => {
  const id = req.params.id;
  if (!id) {
    return next(new BadRequestException());
  }

  if (id !== (req as RequestWithUser).user._id) {
    return next(new UnauthorizedException());
  }

  return next();
};
