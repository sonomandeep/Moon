const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const logger = require('./config/logger.js');

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use((err, req, res, next) => {});

app.listen(process.env.PORT, () => {
  logger.log('info', `Server started on port ${process.env.PORT}`);
});
