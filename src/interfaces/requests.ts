import express from 'express';
import { UserInterface } from '../models/user.model';
import { PaginationOptions } from '.';

export interface RequestWithUser extends express.Request {
  user: UserInterface;
}

export interface RequestWithPagination extends express.Request {
  pagination: PaginationOptions;
}
