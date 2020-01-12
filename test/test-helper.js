const mongoose = require('mongoose');
const dotenv = require('dotenv');

const logger = require('../config/logger');

dotenv.config('../');

before((done) => {
  mongoose
    .connect(process.env.MONGODB_TEST_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => done())
    .catch((err) => logger.log('error', err));
});

beforeEach((done) => {
  mongoose.connection.db
    .dropDatabase()
    .then(() => done())
    .catch((err) => logger.log('error', err.message));
});

after((done) => {
  mongoose.disconnect().then(() => done());
});
