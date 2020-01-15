const auth = require('./auth.route');
const users = require('./users.route');

module.exports = (app) => {
  app.use('/api/auth', auth);
  app.use('/api/users', users);
};
