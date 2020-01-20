import App from './app';

import UsersController from './controllers/users.controller';
import UserService from './services/user.service';

const app = new App([new UsersController(new UserService())]);

app.listen();
