import dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: Number.parseInt(process.env.PORT as string) || 5000,
  MONGO_TEST: process.env.MONGODB_TEST_CONNECTION_STRING as string,
  MONGO: process.env.MONGODB_CONNECTION_STRING as string,
};
