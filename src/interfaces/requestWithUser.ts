import express from 'express';

export default interface RequestWithUser extends express.Request {
  user: string;
}
