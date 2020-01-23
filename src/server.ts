import App from './app';

import UsersController from './controllers/users.controller';
import UserService from './services/user.service';
import AuthController from './controllers/auth.controller';
import AuthService from './services/auth.service';
import PostsController from './controllers/posts.controller';
import PostService from './services/post.service';

const app = new App([
  new AuthController(new AuthService()),
  new UsersController(new UserService()),
  new PostsController(new PostService()),
]);

app.listen();
