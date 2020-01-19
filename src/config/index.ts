import dotenv from 'dotenv';

dotenv.config();

export default {
  MONGO_TEST: process.env.MONGODB_TEST_CONNECTION_STRING as string,
};
