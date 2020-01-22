import { expect } from 'chai';
import express from 'express';
import sinon from 'sinon';

import User from '../../src/models/user.model';
import AuthService from '../../src/services/auth.service';
import { RequestWithUser } from '../../src/interfaces/requests';
import { isAuthenticated } from '../../src/middlewares';

describe('Authentication middleware', () => {
  it('should success passing token', async () => {
    const req: express.Request = express.request;
    req.headers = {
      authorization: 'Bearer xyz',
    };

    const user = new User({
      username: 'test',
      email: 'test@test.com',
      password: 'password',
    });

    const verifyTokenStub = sinon
      .stub(AuthService, 'verifyToken')
      .returns({ id: user._id });
    const findOneStub = sinon.stub(User, 'findOne').resolves(user);

    await isAuthenticated(req, express.response, () => {
      return;
    });

    expect((req as RequestWithUser).user).to.be.equal(user._id);
    verifyTokenStub.restore();
    findOneStub.restore();
  });

  it('should not find authorization header and fail', async () => {
    try {
      await isAuthenticated(express.request, express.response, () => {
        return;
      });
    } catch (error) {
      expect(error.message).to.be.equal('You must pass an authorization token');
      expect(error.statusCode).to.be.equal(401);
    }
  });

  it('should fail in decoding token', async () => {
    try {
      await isAuthenticated(express.request, express.response, () => {
        return;
      });
    } catch (error) {
      expect(error.message).to.be.equal('You must pass a valid token');
      expect(error.statusCode).to.be.equal(401);
    }
  });

  it('should not find a user and fail', () => {
    const verifyTokenStub = sinon.stub(AuthService, 'verifyToken').returns('');
    const findOneStub = sinon.stub(User, 'findOne').resolves(null);

    try {
      isAuthenticated(express.request, express.response, () => {
        return;
      });
    } catch (error) {
      expect(error.message).to.be.equal('Unauthorized');
      expect(error.statusCode).to.be.equal(401);
    }

    verifyTokenStub.restore();
    findOneStub.restore();
  });
});
