import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import App from '../../src/app';
import UsersController from '../../src/controllers/users.controller';
import UserService from '../../src/services/user.service';
import User from '../../src/models/user.model';

const { app } = new App([new UsersController(new UserService())]);

chai.use(chaiHttp);

describe('Users controller', () => {
  describe('GET api/users', () => {
    it('should return an empty array of users', async () => {
      const result = await chai.request(app).get('/api/users');
      expect(result.body).to.be.eql([]);
      expect(result.status).to.be.equal(200);
    });

    it('should return an array of users', async () => {
      for (let i = 0; i < 5; i++) {
        const user = new User({
          username: `user${i}`,
          email: `test${i}@test.com`,
          password: 'password',
        });
        await user.save();
      }

      const result = await chai.request(app).get('/api/users');
      expect(result.body.length).to.be.equal(5);
      expect(result.body[0]).to.deep.include({
        username: 'user0',
        email: 'test0@test.com',
      });
      expect(result.body[4]).to.deep.include({
        username: 'user4',
        email: 'test4@test.com',
      });
      expect(result.status).to.be.equal(200);
    });
  });

  describe('GET api/users/:id', () => {
    it('should return validation error passing an invalid id', async () => {
      const result = await chai.request(app).get('/api/users/id');
      expect(result.body.errors.length).to.be.equal(1);
      expect(result.body.errors[0]).to.deep.include({
        value: 'id',
        msg: 'You must pass a valid id',
        param: 'id',
        location: 'params',
      });
      expect(result.status).to.be.equal(422);
    });

    it('should return 404 not found', async () => {
      const result = await chai
        .request(app)
        .get('/api/users/5e2726dc077ee2343ce59800');
      expect(result.body.message).to.be.equal('User not found');
      expect(result.status).to.be.equal(404);
    });

    it('should return the user for the passed id', async () => {
      const user = new User({
        username: 'user',
        email: 'test@test.com',
        password: 'password',
      });
      await user.save();

      const result = await chai.request(app).get(`/api/users/${user._id}`);
      expect(result.body).to.deep.include({
        _id: user._id.toString(),
        username: 'user',
        email: 'test@test.com',
      });
      expect(result.status).to.be.equal(200);
    });
  });

  describe('PATCH api/users/:id', () => {
    it('should return validation error passing an invalid id', async () => {
      const result = await chai.request(app).get('/api/users/id');
      expect(result.body.errors.length).to.be.equal(1);
      expect(result.body.errors[0]).to.deep.include({
        value: 'id',
        msg: 'You must pass a valid id',
        param: 'id',
        location: 'params',
      });
      expect(result.status).to.be.equal(422);
    });

    it('should return 404 not found', async () => {
      const result = await chai
        .request(app)
        .get('/api/users/5e2726dc077ee2343ce59800');
      expect(result.body.message).to.be.equal('User not found');
      expect(result.status).to.be.equal(404);
    });
  });
});

//   describe('Update user', () => {
//     it('should update user for the passed id', async () => {
//       const user = new User({
//         username: 'user',
//         email: 'test@test.com',
//         password: 'password',
//       });
//       const savedUser = await user.save();

//       const req = {
//         params: {
//           id: savedUser._id,
//         },
//         body: { username: 'userModified', password: 'passwordModified' },
//       };
//       const res = {
//         json: (data) => data,
//       };
//       const next = () => {};

//       sinon.stub(authService, 'hashPassword').returns('passwordModified');

//       return usersController
//         .updateUser(req, res, next)
//         .then((result) => {
//           expect(result.username).to.be.equal('usermodified');
//           expect(result.email).to.be.equal('test@test.com');
//           expect(result.password).to.be.equal('passwordModified');
//         })
//         .catch((err) => {
//           throw err;
//         })
//         .finally(() => {
//           authService.hashPassword.restore();
//         });
//     });

//     it('should throw bad request error for not passing id', async () => {
//       const req = {
//         params: {},
//       };
//       const res = {
//         json: (data) => data,
//       };
//       const next = () => {};

//       return usersController
//         .updateUser(req, res, next)
//         .then(() => {
//           throw new Error('It should fail');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal('Bad request');
//           expect(err.statusCode).to.be.equal(400);
//         });
//     });
//   });

//   describe('Delete user by id', () => {
//     it('should delete the user that corresponds to the passed id', () => {
//       const req = { params: { id: 1 } };
//       const res = {
//         status: () => {},
//         send: () => {},
//       };
//       const next = () => {};

//       const resStatusStub = sinon.stub(res, 'status');
//       const resSendStub = sinon.stub(res, 'send');
//       sinon.stub(User, 'findByIdAndDelete').returns(true);

//       return usersController
//         .deleteUser(req, res, next)
//         .then(() => {
//           expect(resStatusStub.called).to.be.true;
//           expect(resSendStub.called).to.be.true;
//         })
//         .catch()
//         .finally(() => {
//           User.findByIdAndDelete.restore();
//         });
//     });

//     it('should throw error for not passing id', async () => {
//       const req = { params: {} };
//       const res = {
//         status: () => {},
//         send: () => {},
//       };
//       const next = () => {};

//       return usersController
//         .deleteUser(req, res, next)
//         .then(() => {
//           throw new Error('It should fail');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal('Bad request');
//           expect(err.statusCode).to.be.equal(400);
//         });
//     });

//     it('should not find user for passed id', () => {
//       const req = { params: { id: 1 } };
//       const res = {
//         status: () => {},
//         send: () => {},
//       };
//       const next = () => {};

//       sinon.stub(User, 'findByIdAndDelete').returns(false);

//       return usersController
//         .deleteUser(req, res, next)
//         .then(() => {
//           throw new Error('It should fail');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal('Not found');
//           expect(err.statusCode).to.be.equal(404);
//         })
//         .finally(() => {
//           User.findByIdAndDelete.restore();
//         });
//     });
//   });

//   describe('Follow user', () => {
//     it('should success with passing the right data', () => {
//       const req = { user: { _id: 1 }, body: { recipientId: 2 } };
//       const res = {
//         status: (code) => {
//           this.code = code;
//         },
//         send: () => this.code,
//       };
//       const next = () => {};

//       const findByIdStub = sinon.stub(User, 'findById');
//       findByIdStub
//         .withArgs(1)
//         .returns({ _id: 1, followed: [], save: () => true });
//       findByIdStub
//         .withArgs(2)
//         .returns({ _id: 2, followers: [], save: () => true });

//       return usersController
//         .followUser(req, res, next)
//         .then((result) => {
//           expect(findByIdStub.callCount).to.be.equal(2);
//           expect(findByIdStub.calledWith(1)).to.be.equal(true);
//           expect(findByIdStub.calledWith(2)).to.be.equal(true);
//           expect(result).to.be.equal(204);
//         })
//         .catch((err) => {
//           throw err;
//         })
//         .finally(() => {
//           User.findById.restore();
//         });
//     });

//     it('should not find the recipient user', () => {
//       const req = { user: { _id: 1 }, body: { recipientId: 2 } };
//       const res = {
//         status: (code) => {
//           this.code = code;
//         },
//         send: () => this.code,
//       };
//       const next = () => {};

//       const findByIdStub = sinon.stub(User, 'findById');
//       findByIdStub
//         .withArgs(1)
//         .returns({ _id: 1, followed: [], save: () => true });
//       findByIdStub.withArgs(2).returns(false);

//       return usersController
//         .followUser(req, res, next)
//         .then(() => {
//           throw new Error('It should fail');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal('Not found');
//           expect(err.statusCode).to.be.equal(404);
//         })
//         .finally(() => {
//           User.findById.restore();
//         });
//     });
//   });

//   describe('Unfollow user', () => {
//     it('should unfollow user successfully passing the right data', () => {
//       const req = { user: { _id: 1 }, body: { recipientId: 2 } };
//       const res = {
//         status: (code) => {
//           this.code = code;
//         },
//         send: () => this.code,
//       };
//       const next = () => {};

//       const findByIdStub = sinon.stub(User, 'findById');
//       findByIdStub
//         .withArgs(1)
//         .returns({ _id: 1, followed: [], save: () => true });
//       findByIdStub
//         .withArgs(2)
//         .returns({ _id: 2, followers: [], save: () => true });

//       return usersController
//         .unfollowUser(req, res, next)
//         .then((result) => {
//           expect(findByIdStub.callCount).to.be.equal(2);
//           expect(findByIdStub.calledWith(1)).to.be.equal(true);
//           expect(findByIdStub.calledWith(2)).to.be.equal(true);
//           expect(result).to.be.equal(204);
//         })
//         .catch((err) => {
//           throw err;
//         })
//         .finally(() => {
//           User.findById.restore();
//         });
//     });

//     it('should not find the recipient user', () => {
//       const req = { user: { _id: 1 }, body: { recipientId: 2 } };
//       const res = {
//         status: (code) => {
//           this.code = code;
//         },
//         send: () => this.code,
//       };
//       const next = () => {};

//       const findByIdStub = sinon.stub(User, 'findById');
//       findByIdStub
//         .withArgs(1)
//         .returns({ _id: 1, followed: [], save: () => true });
//       findByIdStub.withArgs(2).returns(false);

//       return usersController
//         .unfollowUser(req, res, next)
//         .then(() => {
//           throw new Error('It should fail');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal('Not found');
//           expect(err.statusCode).to.be.equal(404);
//         })
//         .finally(() => {
//           User.findById.restore();
//         });
//     });
//   });
// });
