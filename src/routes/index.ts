import { Application } from 'express';

import auth from './auth.route';
import users from './users.route';

export default (app: Application) => {
  app.use('/api/auth', auth);
  app.use('/api/users', users);
};
