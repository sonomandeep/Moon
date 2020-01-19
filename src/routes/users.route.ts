import express from 'express';

const Router = express.Router();

import * as usersController from '../controllers/users.controller';
import isAuth from '../middlewares/is-auth.middleware';
import isAuthorized from '../middlewares/is-authorized.middleware';

Router.get('', isAuth, usersController.getUsers);
Router.get('/:id', isAuth, usersController.getUser);
Router.put('/:id', isAuth, isAuthorized, usersController.updateUser);
Router.delete('/:id', isAuth, isAuthorized, usersController.deleteUser);

Router.post('/follow', isAuth, usersController.followUser);

export default Router;
