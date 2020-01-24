import express from 'express';
import { body, param } from 'express-validator';

import { isAuthenticated, handleValidation } from '../middlewares';

export const authAndPostCreationValidator = (): ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void)[] => {
  return [
    isAuthenticated,
    body('description')
      .isString()
      .withMessage('You must pass a description.')
      .trim(),
    handleValidation,
  ];
};

export const authAndPostUpdateValidator = (): ((
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void)[] => {
  return [
    isAuthenticated,
    param('id')
      .isMongoId()
      .withMessage('You must pass a valid id'),
    body('description')
      .isString()
      .withMessage('You must pass a description.')
      .trim()
      .optional(),
    handleValidation,
  ];
};
