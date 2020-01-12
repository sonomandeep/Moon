import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './config/logger.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use((err, req, res, next) => {});

app.listen(process.env.PORT, () => {
  logger.log('info', `Server started on port ${process.env.PORT}`);
});
