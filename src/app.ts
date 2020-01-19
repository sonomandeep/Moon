import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';

import logger from './config/logger.js';
import routes from './routes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

routes(app);

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  res
    .status(error.statusCode || 500)
    .json(error.data || { message: error.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.log('info', 'Connected to mongodb');
    app.listen(process.env.PORT, () => {
      logger.log('info', `Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.log('error', err);
    throw err;
  });
