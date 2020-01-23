import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { UserServiceInterface } from '../services/user.service';
import UpdateUserDto from '../dtos/user/updateUser.dto';
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from '../exceptions';
import Controller from '../interfaces/controller';
import { RequestWithUser } from '../interfaces';
import { isAuthenticated } from '../middlewares';
import { RequestWithPagination } from '../interfaces/requests';
import {
  getUsersMiddlewares,
  defaultMiddlewares,
} from '../validation/users.validation';

export default class UsersController implements Controller {
  private path = '/users';
  public router = Router();

  constructor(private userService: UserServiceInterface) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, getUsersMiddlewares(), this.getUsers);
    this.router.get(`${this.path}/:id`, defaultMiddlewares(), this.getUserById);
    this.router.patch(
      `${this.path}/:id`,
      defaultMiddlewares(),
      this.updateUser,
    );
    this.router.delete(
      `${this.path}/:id`,
      defaultMiddlewares(),
      this.deleteUser,
    );
    this.router.post(`${this.path}/follow`, isAuthenticated, this.followUser);
    this.router.post(
      `${this.path}/unfollow`,
      isAuthenticated,
      this.unfollowUser,
    );
  }

  private getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const { pagination } = req as RequestWithPagination;

    try {
      const users = await this.userService.getUsers(pagination);
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
    const { user } = req as RequestWithUser;
    const { recipientId } = req.body;

    try {
      const result = await this.userService.followUser(user._id, recipientId);
      if (!result) {
        throw new BadRequestException('You must pass a valid recipient id');
      }
    } catch (error) {
      return next(error);
    }

    return res.status(204).send();
  };

  private unfollowUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const { user } = req as RequestWithUser;
    const { recipientId } = req.body;

    try {
      const result = await this.userService.unfollowUser(user._id, recipientId);
      if (!result) {
        throw new BadRequestException('You must pass a valid recipient id');
      }
    } catch (error) {
      return next(error);
    }

    return res.status(204).send();
  };
}
