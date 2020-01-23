import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import AuthService from '../../src/services/auth.service';
import NotFoundException from '../../src/exceptions/notFound.exception';
import User from '../../src/models/user.model';

const authService = new AuthService();

describe('Auth service', () => {
  describe('Register', () => {
    it('should register a new user successfully', async () => {
      const hashStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
      const user = await authService.register({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      expect(user).to.deep.include({
        username: 'test',
        email: 'test@test.com',
      });

      hashStub.restore();
    });
  });

  describe('Login', () => {
    it('should throw user not found error', async () => {
      try {
        await authService.login({
          username: 'test',
          password: 'password',
        });
      } catch (error) {
        expect((error as NotFoundException).status).to.be.equal(404);
        expect((error as NotFoundException).message).to.be.equal(
          'User not found',
        );
      }
    });

    it('should throw bad credentials error', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      try {
        await authService.login({
          username: 'test',
          password: 'wrongPassword',
        });
      } catch (error) {
        expect((error as NotFoundException).status).to.be.equal(401);
        expect((error as NotFoundException).message).to.be.equal(
          'A user with this username/password combination does not exist',
        );
      }
    });

    it('should login successfully and generate a jwt token', async () => {
      const compareStub = sinon.stub(bcrypt, 'compare').resolves(true);
      const generateStub = sinon
        .stub(authService, 'generateToken')
        .returns('tokenMock');

      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      const logged = await authService.login({
        username: 'test',
        password: 'password',
      });

      expect(logged).to.deep.include({
        username: 'test',
        email: 'test@test.com',
        followers: [],
        followed: [],
      });
      expect(logged.jwtToken).to.be.string;
      expect(logged.jwtToken).to.be.equal('tokenMock');

      compareStub.restore();
      generateStub.restore();
    });
  });
});
