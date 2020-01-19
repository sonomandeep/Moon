import { Request, Response, NextFunction } from 'express';
import * as expressValidator from 'express-validator';

export default (req: Request, _res: Response, next: NextFunction) => {
  const errors = expressValidator.validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation error');
    (error as any).statusCode = 422;
    (error as any).data = errors.array();
    throw error;
  }

  next();
};
