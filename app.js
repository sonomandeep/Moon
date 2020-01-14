const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');

const logger = require('./config/logger.js');
const routes = require('./routes');
const authRoute = require('./routes/auth.route');

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

routes(app);

app.use((error, req, res, next) => {
  res
    .status(error.statusCode || 500)
    .json(error.data || { message: error.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
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
