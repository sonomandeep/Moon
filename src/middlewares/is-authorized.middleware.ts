import { Request, Response, NextFunction } from 'express';

import logger from '../config/logger';

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      (error as any).statusCode = 400;
      throw error;
    }

    if (id !== (req as any).user._id) {
      const error = new Error('Unauthorized');
      (error as any).statusCode = 403;
      throw error;
    }

    next();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};
