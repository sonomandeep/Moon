import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import logger from './config/logger';
import config from './config';
import Controller from './interfaces/controller';
import morgan from 'morgan';
import { HttpException, ValidationException } from './exceptions/index';

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
    try {
      await mongoose.connect(config.MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.log(error);
    }
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
        let response = {};
        const status = error.status || 500;

        response = { ...response, status };
        response = {
          ...response,
          message: error.message || 'Something went wrong',
        };

        if (error instanceof ValidationException) {
          const data = error.errors;
          response = { ...response, errors: data };
        }

        res.status(status).json(response);
      },
    );
  }
}
