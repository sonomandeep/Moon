import express from 'express';
import { UserInterface } from '../models/user.model';

export default interface RequestWithUser extends express.Request {
  user: UserInterface;
}
