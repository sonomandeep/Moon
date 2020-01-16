const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');

const usersController = require('../../controllers/users.controller');
const User = require('../../models/user.model');
const authService = require('../../services/auth.service');

describe('Users controller', () => {
  describe('Get all users', () => {
    it('should return a list of users successfully', async () => {
      const req = {};
      const res = { json: (data) => data };
      const next = () => {};

      try {
        for (let i = 0; i < 5; i++) {
          const user = new User({
            username: `user${i}`,
            email: `test${i}@test.com`,
            password: 'password',
          });
          await user.save();
        }
      } catch (error) {
        throw error;
      }

      return usersController
        .getUsers(req, res, next)
        .then((result) => {
          expect(result)
            .to.be.an('array')
            .of.length(5);
          expect(result[0]).to.deep.include({
            username: 'user0',
            email: 'test0@test.com',
          });
          expect(result[4]).to.deep.include({
            username: 'user4',
            email: 'test4@test.com',
          });
        })
        .catch((err) => {
          throw err;
        });
    });

    it('should handle errors', async () => {
      const req = {};
      const res = { json: (data) => data };
      const factory = { next: () => {} };

      sinon.stub(User, 'find').throws(new Error('Error finding users'));
      const stub = sinon.stub(factory, 'next');

      return usersController
        .getUsers(req, res, factory.next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(stub.called).to.be.true;
          expect(err.message).to.be.equal('Error finding users');
        })
        .finally(() => {
          User.find.restore();
        });
    });
  });

  describe('Get user by id', () => {
    it('should return user for id 1', () => {
      const req = {
        params: { id: 1 },
      };
      const res = {
        json: (data) => data,
      };
      const next = () => {};

      sinon.stub(User, 'findOne').returns({
        _id: 1,
        username: 'user',
        email: 'test@test.com',
      });

      return usersController
        .getUser(req, res, next)
        .then((result) => {
          expect(result).to.deep.include({
            username: 'user',
            email: 'test@test.com',
          });
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          User.findOne.restore();
        });
    });

    it('should throw error for not passing id in req params', async () => {
      const req = {
        params: {},
      };
      const res = {};
      const next = () => {};

      return usersController
        .getUser(req, res, next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('Bad request');
          expect(err.statusCode).to.be.equal(400);
        });
    });

    it('should return user not found', () => {
      const req = {
        params: { id: 1 },
      };
      const res = {
        json: (data) => data,
      };
      const next = () => {};

      sinon.stub(User, 'findOne').returns(false);

      return usersController
        .getUser(req, res, next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('Not found');
          expect(err.statusCode).to.be.equal(404);
        })
        .finally(() => {
          User.findOne.restore();
        });
    });
  });

  describe('Update user', () => {
    it('should update user for the passed id', async () => {
      const user = new User({
        username: 'user',
        email: 'test@test.com',
        password: 'password',
      });
      const savedUser = await user.save();

      const req = {
        params: {
          id: savedUser._id,
        },
        body: { username: 'userModified', password: 'passwordModified' },
      };
      const res = {
        json: (data) => data,
      };
      const next = () => {};

      sinon.stub(authService, 'hashPassword').returns('passwordModified');

      return usersController
        .updateUser(req, res, next)
        .then((result) => {
          expect(result.username).to.be.equal('usermodified');
          expect(result.email).to.be.equal('test@test.com');
          expect(result.password).to.be.equal('passwordModified');
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          authService.hashPassword.restore();
        });
    });

    it('should throw bad request error for not passing id', async () => {
      const req = {
        params: {},
      };
      const res = {
        json: (data) => data,
      };
      const next = () => {};

      return usersController
        .updateUser(req, res, next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('Bad request');
          expect(err.statusCode).to.be.equal(400);
        });
    });
  });

  describe('Delete user by id', () => {
    it('should delete the user that corresponds to the passed id', () => {
      const req = { params: { id: 1 } };
      const res = {
        status: () => {},
        send: () => {},
      };
      const next = () => {};

      const resStatusStub = sinon.stub(res, 'status');
      const resSendStub = sinon.stub(res, 'send');
      sinon.stub(User, 'findByIdAndDelete').returns(true);

      return usersController
        .deleteUser(req, res, next)
        .then(() => {
          expect(resStatusStub.called).to.be.true;
          expect(resSendStub.called).to.be.true;
        })
        .catch()
        .finally(() => {
          User.findByIdAndDelete.restore();
        });
    });

    it('should throw error for not passing id', async () => {
      const req = { params: {} };
      const res = {
        status: () => {},
        send: () => {},
      };
      const next = () => {};

      return usersController
        .deleteUser(req, res, next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('Bad request');
          expect(err.statusCode).to.be.equal(400);
        });
    });

    it('should not find user for passed id', () => {
      const req = { params: { id: 1 } };
      const res = {
        status: () => {},
        send: () => {},
      };
      const next = () => {};

      sinon.stub(User, 'findByIdAndDelete').returns(false);

      return usersController
        .deleteUser(req, res, next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('Not found');
          expect(err.statusCode).to.be.equal(404);
        })
        .finally(() => {
          User.findByIdAndDelete.restore();
        });
    });
  });

  describe('Follow user', () => {
    it('should success with passing the right data', () => {
      const req = { user: { _id: 1 }, body: { recipientId: 2 } };
      const res = {
        status: (code) => {
          this.code = code;
        },
        send: () => {
          return this.code;
        },
      };
      const next = () => {};

      const findByIdStub = sinon.stub(User, 'findById');
      findByIdStub
        .withArgs(1)
        .returns({ _id: 1, followed: [], save: () => true });
      findByIdStub
        .withArgs(2)
        .returns({ _id: 1, followers: [], save: () => true });

      return usersController
        .followUser(req, res, next)
        .then((result) => {
          expect(findByIdStub.callCount).to.be.equal(2);
          expect(findByIdStub.calledWith(1)).to.be.equal(true);
          expect(findByIdStub.calledWith(2)).to.be.equal(true);
          expect(result).to.be.equal(204);
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          User.findById.restore();
        });
    });

    it('should not find the recipient user', () => {
      const req = { user: { _id: 1 }, body: { recipientId: 2 } };
      const res = {
        status: (code) => {
          this.code = code;
        },
        send: () => {
          return this.code;
        },
      };
      const next = () => {};

      const findByIdStub = sinon.stub(User, 'findById');
      findByIdStub
        .withArgs(1)
        .returns({ _id: 1, followed: [], save: () => true });
      findByIdStub.withArgs(2).returns(false);

      return usersController
        .followUser(req, res, next)
        .then(() => {
          throw new Error('It should fail');
        })
        .catch((err) => {
          expect(err.message).to.be.equal('Not found');
          expect(err.statusCode).to.be.equal(404);
        })
        .finally(() => {
          User.findById.restore();
        });
    });
  });

  describe('Unfollow user', () => {});
});
