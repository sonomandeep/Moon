import express from 'express';
import { expect } from 'chai';

import { RequestWithUser } from '../../src/interfaces/requests';
import { isAuthorized } from '../../src/middlewares';
import User from '../../src/models/user.model';
import sinon from 'sinon';

describe('Authorization middleware', () => {
  it('should throw bad request error', () => {
    const req = express.request;
    req.params = {};

    try {
      isAuthorized(req, express.response, () => {
        return;
      });
    } catch (error) {
      expect(error.message).to.be.equal('Bad request');
      expect(error.statusCode).to.be.equal(400);
    }
  });

  it('should fail id check', () => {
    const req = express.request;
    req.params = { id: '1' };
    (req as RequestWithUser).user = new User({
      username: 'test',
      email: 'test@test.com',
      password: 'password',
    });

    try {
      isAuthorized(req, express.response, () => {
        return;
      });
    } catch (error) {
      expect(error.message).to.be.equal('Unauthorized');
      expect(error.statusCode).to.be.equal(403);
    }
  });

  it('should success passing the right data', () => {
    const user = new User({
      username: 'test',
      email: 'test@test.com',
      password: 'password',
    });
    const req = express.request;
    req.params = { id: user._id };
    (req as RequestWithUser).user = user;

    let passed: Error = new Error();
    const next = (args: Error): void => {
      passed = args;
    };

    isAuthorized(req, express.response, next);
    expect(passed).to.be.undefined;
  });
});
