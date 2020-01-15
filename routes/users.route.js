const Router = require('express').Router();

const usersController = require('../controllers/users.controller');

Router.get('', usersController.get);

module.exports = Router;
