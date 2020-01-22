import express from 'express';

import config from '../config';
import { RequestWithPagination } from '../interfaces/requests';

export default (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
): void => {
  const limit = parseInt(req.query.limit) || config.constants.pagination.limit;
  const skip = parseInt(req.query.skip) || config.constants.pagination.skip;

  (req as RequestWithPagination).pagination = { limit, skip };
  return next();
};
