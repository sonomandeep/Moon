import mongoose from 'mongoose';

import config from '../src/config';
import logger from '../src/config/logger';

logger.silent = true;

before((done) => {
  mongoose
    .connect(config.MONGO_TEST, {
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
