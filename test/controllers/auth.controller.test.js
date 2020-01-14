const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');

const authController = require('../../controllers/auth.controller');
const User = require('../../models/user.model');

describe('Auth controller', () => {
  describe('Register', () => {
    it('should create new user', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'testuser@test.com',
          password: 'password',
        },
      };
      const res = { json: (data) => data };

      return authController
        .register(req, res, () => {})
        .then(({ id, username, email }) => {
          expect(id).to.not.be.null;
          expect(username).to.be.equal('testuser');
          expect(email).to.be.equal('testuser@test.com');
        })
        .catch((err) => {
          throw err;
        });
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      sinon.stub(bcrypt, 'compare').returns(true);

      const req = {
        body: { username: 'testuser', password: 'password' },
      };

      const res = { json: (data) => data };

      const user = new User({
        username: 'testuser',
        password: 'password',
        email: 'testuser@test.com',
      });
      try {
        await user.save();
      } catch (error) {
        throw error;
      }

      return authController
        .login(req, res, () => {})
        .then((result) => {
          expect(result.jwtToken).to.be.not.null;
          expect(result.user._id).to.be.not.null;
          expect(result.user.username).to.be.equal('testuser');
          expect(result.user.email).to.be.equal('testuser@test.com');
        })
        .catch((err) => {
          console.log('ERRORE');
          throw err;
        })
        .finally(() => {
          bcrypt.compare.restore();
        });
    });

    it('should not find a user', async () => {
      const req = {
        body: { username: 'testuser', password: 'password' },
      };

      const res = { json: (data) => data };

      return authController
        .login(req, res, () => {})
        .then(() => {
          throw new Error('This should throw error');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('User not found');
          expect(err.statusCode).to.be.equal(404);
        });
    });

    it('should throw error for incorrect credentials', async () => {
      const req = {
        body: { username: 'testuser', password: 'password' },
      };

      const res = { json: (data) => data };

      const user = new User({ ...req.body, email: 'testuser@test.com' });
      try {
        await user.save();
      } catch (error) {
        throw error;
      }

      return authController
        .login(req, res, () => {})
        .then(() => {
          throw new Error('This should throw error');
        })
        .catch((err) => {
          expect(err.message).to.be.equal(
            'This username/password combination does not exist',
          );
          expect(err.statusCode).to.be.equal(401);
        });
    });
  });
});
