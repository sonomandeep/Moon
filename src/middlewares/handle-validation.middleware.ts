import express, { NextFunction } from 'express';
import * as expressValidator from 'express-validator';
import { ValidationException } from '../exceptions';

export default (
  req: express.Request,
  _res: express.Response,
  next: NextFunction,
): void => {
  const errors = expressValidator.validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ValidationException(errors.array()));
  }

  return next();
};
