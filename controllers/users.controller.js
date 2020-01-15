const User = require('../models/user.model');
const authService = require('../services/auth.service');
const logger = require('../config/logger');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('_id username email followers followed')
      .populate('followers', '_id username email')
      .populate('followed', '_id username email');

    return res.json(users);
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      const error = new Error('Not found');
      error.statusCode = 404;
      throw error;
    }

    return res.json(user);
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      error.statusCode = 400;
      throw error;
    }

    const updateArray = Object.keys(req.body);
    let update = {};

    updateArray.forEach((element) => {
      if (element === 'password') {
        update = {
          ...update,
          [element]: authService.hashPassword(req.body[element]),
        };
      } else {
        update = { ...update, [element]: req.body[element] };
      }
    });

    const updated = await User.findOneAndUpdate({ _id: id }, update, {
      new: true,
    });

    return res.json(updated);
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      error.statusCode = 400;
      throw error;
    }

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error('Not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(204);
    return res.send();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};

exports.followUser = async (req, res, next) => {
  // Ricevo l'id del mandante e del ricevente
  // Aggiungo il ricevente ai seguiti del mandante
  // Aggiungo ai seguaci del ricevente l'id del mandante

  try {
    const { userId, recipientId } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      const error = new Error('Not found');
      error.statusCode = 404;
      throw error;
    }

    recipient.followers.push(req.user._id);
    await recipient.save();

    const sender = await User.findById(req.user._id);
    sender.followed.push(recipientId);
    await sender.save();

    res.status(204);
    return res.send();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};
