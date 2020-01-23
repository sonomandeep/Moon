import express from 'express';
import { param } from 'express-validator';
import { isAuthenticated, paginate } from '../middlewares';

type Middleware = ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void)[];

export const getUsersMiddlewares = (): ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void)[] => {
  return [isAuthenticated, paginate];
};

export const defaultMiddlewares = (): ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void)[] => {
  return [
    isAuthenticated,
    param('id')
      .isMongoId()
      .withMessage('You must pass a valid id'),
  ];
};
