import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import logger from './config/logger';
import config from './config';
import Controller from './interfaces/controller';
import morgan from 'morgan';
import { HttpException } from './exceptions/index';

export default class App {
  public app: Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen(): void {
    this.app.listen(config.PORT, () => {
      console.log(`Server started on port ${config.PORT}`);
    });
  }

  private async connectToTheDatabase(): Promise<void> {
    await mongoose.connect(config.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use('/api/', controller.router);
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(
      (
        error: HttpException,
        _req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction,
      ) => {
        logger.error(error);
        const status = error.status || 500;
        const message = error.message || 'Something went wrong';
        res.status(status).json({ status, message });
      },
    );
  }
}

// import dotenv from 'dotenv';
// import morgan from 'morgan';
// import mongoose from 'mongoose';

// import { HttpException } from './exceptions/index.js';

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(morgan('dev'));

// routes(app);

// app.use(
//   (error: HttpException, _req: Request, res: Response, next: NextFunction) => {
//     const status = error.status || 500;
//     const message = error.message || 'Something went wrong';
//     res.status(status).json({ status, message });
//   },
// );

// mongoose
//   .connect(process.env.MONGODB_CONNECTION_STRING as string, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     logger.log('info', 'Connected to mongodb');
//     app.listen(process.env.PORT, () => {
//       logger.log('info', `Server started on port ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     logger.log('error', err);
//     throw err;
//   });
