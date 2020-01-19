import { Request, Response, NextFunction } from 'express';

import User, { IUser } from '../models/user.model';
import * as authService from '../services/auth.service';
import logger from '../config/logger';

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
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

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      (error as any).statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      const error = new Error('Not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return res.json(user);
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      (error as any).statusCode = 400;
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

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id) {
      const error = new Error('Bad request');
      (error as any).statusCode = 400;
      throw error;
    }

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error('Not found');
      (error as any).statusCode = 404;
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

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { recipientId } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      const error = new Error('Not found');
      (error as any).statusCode = 404;
      throw error;
    }

    recipient.followers.push(((req as any).user as IUser)._id);
    await recipient.save();

    const sender = await User.findById(((req as any).user as IUser)._id);
    sender!.followed.push(recipientId);
    await sender!.save();

    res.status(204);
    return res.send();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { recipientId } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      const error = new Error('Not found');
      (error as any).statusCode = 404;
      throw error;
    }

    recipient.followers = recipient.followers.filter(
      (element) => element.toString() !== (req as any).user._id.toString(),
    );
    await recipient.save();

    const sender = await User.findById((req as any).user._id);
    sender!.followed = sender!.followed.filter(
      (element) => element.toString() !== recipientId.toString(),
    );
    await sender!.save();

    res.status(204);
    return res.send();
  } catch (error) {
    logger.log('error', error);
    next(error);
    throw error;
  }
};
