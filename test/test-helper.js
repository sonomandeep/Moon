const mongoose = require('mongoose');
const dotenv = require('dotenv');

const logger = require('../config/logger');

dotenv.config('../');
logger.transports.forEach((t) => (t.silent = true));

before((done) => {
  mongoose
    .connect(process.env.MONGODB_TEST_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => done())
    .catch((err) => console.log('error', err));
});

beforeEach((done) => {
  mongoose.connection.db
    .dropDatabase()
    .then(() => done())
    .catch((err) => console.log('error', err.message));
});

after((done) => {
  mongoose.disconnect().then(() => done());
});
