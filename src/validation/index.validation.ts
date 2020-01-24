import express from 'express';
import { param } from 'express-validator';

import { isAuthenticated, handleValidation } from '../middlewares';

export const authAndIdValidator = (): ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void)[] => {
  return [
    isAuthenticated,
    param('id')
      .isMongoId()
      .withMessage('You must pass a valid id'),
    handleValidation,
  ];
};
