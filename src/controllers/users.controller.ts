import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';

import { UserServiceInterface } from '../services/user.service';
import UpdateUserDto from '../dtos/user/updateUser.dto';
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from '../exceptions';
import Controller from '../interfaces/controller';
import RequestWithUser from '../interfaces/requestWithUser';
import { isAuthenticated } from '../middlewares';

export default class UsersController implements Controller {
  private path = '/users';
  public router = Router();

  constructor(private userService: UserServiceInterface) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, isAuthenticated, this.getUsers);
    this.router.get(
      `${this.path}/:id`,
      // isAuthenticated,
      param('id')
        .isMongoId()
        .withMessage('You must pass a valid id'),
      this.getUserById,
    );
    this.router.patch(
      `${this.path}/:id`,
      isAuthenticated,
      param('id')
        .isMongoId()
        .withMessage('You must pass a valid id'),
      this.updateUser,
    );
    this.router.delete(
      `${this.path}/:id`,
      isAuthenticated,
      param('id')
        .isMongoId()
        .withMessage('You must pass a valid id'),
      this.deleteUser,
    );
    this.router.post(`${this.path}/follow`, isAuthenticated, this.followUser);
  }

  private getUsers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const users = await this.userService.getUsers();
      return res.json(users);
    } catch (error) {
      return next(error);
    }
  };

  private getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }

    const id = req.params.id;
    if (!id) {
      return next(new BadRequestException('You must pass an id'));
    }

    try {
      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  };

  private updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }

    const id = req.params.id;
    const updateUserDto: UpdateUserDto = req.body;

    try {
      const user = await this.userService.updateUser(id, updateUserDto);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  };

  private deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }

    const id = req.params.id;

    try {
      const user = await this.userService.deleteUser(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  private followUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const { userId, recipientId } = req.body;

    const result = await this.userService.followUser(userId, recipientId);
    if (!result) {
      return next(
        new BadRequestException('You must pass a valid recipient id'),
      );
    }

    return res.status(204).send();
  };
}

// export const unfollowUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { recipientId } = req.body;

//     const recipient = await User.findById(recipientId);
//     if (!recipient) {
//       const error = new Error('Not found');
//       (error as any).statusCode = 404;
//       throw error;
//     }

//     recipient.followers = recipient.followers.filter(
//       (element) => element.toString() !== (req as any).user._id.toString(),
//     );
//     await recipient.save();

//     const sender = await User.findById((req as any).user._id);
//     sender!.followed = sender!.followed.filter(
//       (element) => element.toString() !== recipientId.toString(),
//     );
//     await sender!.save();

//     res.status(204);
//     return res.send();
//   } catch (error) {
//     logger.log('error', error);
//     next(error);
//     throw error;
//   }
// }
