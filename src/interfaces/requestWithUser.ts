import { Request } from 'express';
import { UserInterface } from '../models/user.model';

export default interface RequestWithUser extends Request {
  user: UserInterface;
}
