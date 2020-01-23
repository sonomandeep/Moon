import App from './app';

import UsersController from './controllers/users.controller';
import UserService from './services/user.service';
import AuthController from './controllers/auth.controller';
import AuthService from './services/auth.service';

const app = new App([
  new UsersController(new UserService()),
  new AuthController(new AuthService()),
]);

app.listen();
