const { expect } = require('chai');
const sinon = require('sinon');

const isAuth = require('../../middlewares/is-auth.middleware');
const authService = require('../../services/auth.service');
const User = require('../../models/user.model');

describe('Is auth middleware', () => {
  it('should success with valid token', () => {
    const factory = {
      next: () => {},
    };
    const stub = sinon.stub(factory, 'next');
    sinon.stub(authService, 'verifyToken').returns(true);
    sinon.stub(User, 'findOne').returns({ _id: 1, username: 'test' });

    const req = { get: () => 'Bearer xyz' };

    return isAuth(req, {}, factory.next)
      .then(() => {
        expect(req.user._id).to.be.equal(1);
        expect(req.user.username).to.be.equal('test');
        expect(stub.called).to.be.true;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        authService.verifyToken.restore();
        User.findOne.restore();
      });
  });

  it('should not find authorization header and fail', async () => {
    const req = { get: () => '' };

    return isAuth(req, {}, () => {})
      .then(() => {
        throw new Error('This sould fail');
      })
      .catch((error) => {
        expect(error.message).to.be.equal(
          'You must pass an authorization token',
        );
        expect(error.statusCode).to.be.equal(401);
      });
  });

  it('should fail in decoding token', async () => {
    const req = { get: () => 'Bearer xyz' };

    return isAuth(req, {}, () => {})
      .then(() => {
        throw new Error('This sould fail');
      })
      .catch((error) => {
        expect(error.message).to.be.equal('You must pass a valid token');
        expect(error.statusCode).to.be.equal(401);
      });
  });

  it('should not find a user and fail', () => {
    sinon.stub(authService, 'verifyToken').returns(true);
    sinon.stub(User, 'findOne').returns(false);

    const req = { get: () => 'Bearer xyz' };

    return isAuth(req, {}, () => {})
      .then(() => {
        throw new Error('This sould fail');
      })
      .catch((error) => {
        expect(error.message).to.be.equal('Unauthorized');
        expect(error.statusCode).to.be.equal(401);
      })
      .finally(() => {
        authService.verifyToken.restore();
        User.findOne.restore();
      });
  });
});
