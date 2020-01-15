const Router = require('express').Router();

const usersController = require('../controllers/users.controller');
const isAuth = require('../middlewares/is-auth.middleware');
const isAuthorized = require('../middlewares/is-authorized.middleware');

Router.get('', isAuth, usersController.getUsers);
Router.get('/:id', isAuth, usersController.getUser);
Router.put('/:id', isAuth, isAuthorized, usersController.updateUser);
Router.delete('/:id', isAuth, isAuthorized, usersController.deleteUser);

Router.post('/follow', isAuth, usersController.followUser);

module.exports = Router;
