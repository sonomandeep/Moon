import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import express, { NextFunction, Response, Application } from 'express';

import App from '../../src/app';
import UsersController from '../../src/controllers/users.controller';
import UserService from '../../src/services/user.service';
import User from '../../src/models/user.model';
import * as middlewares from '../../src/middlewares';
import RequestWithUser from '../../src/interfaces/requestWithUser';

// const { app } = new App([new UsersController(new UserService())]);

let app: Application;
let authenticateStub: Sinon.SinonStub<
  [express.Request, express.Response, express.NextFunction],
  Promise<void>
>;

chai.use(chaiHttp);
const userService = new UserService();

describe('Users controller', () => {
  before(() => {
    authenticateStub = Sinon.stub(middlewares, 'isAuthenticated').callsFake(
      async (
        req: express.Request,
        _res: Response,
        next: NextFunction,
      ): Promise<void> => {
        (req as RequestWithUser).user = '56cb91bdc3464f14678934ca';
        next();
      },
    );
    app = new App([new UsersController(userService)]).app;
  });

  after(() => {
    authenticateStub.restore();
  });

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
      const result = await chai.request(app).patch('/api/users/id');
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
        .patch('/api/users/5e2726dc077ee2343ce59800');
      expect(result.body.message).to.be.equal('User not found');
      expect(result.status).to.be.equal(404);
    });

    it('should update and return the user for the passed id', async () => {
      const user = new User({
        username: 'user',
        email: 'test@test.com',
        password: 'password',
      });
      await user.save();

      const result = await chai
        .request(app)
        .patch(`/api/users/${user._id}`)
        .send({ username: 'modified' });
      expect(result.body).to.deep.include({
        _id: user._id.toString(),
        username: 'modified',
        email: 'test@test.com',
      });
      expect(result.status).to.be.equal(200);
    });
  });

  describe('DELETE api/users/:id', () => {
    it('should return validation error passing an invalid id', async () => {
      const result = await chai.request(app).delete('/api/users/id');
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
        .delete('/api/users/5e2726dc077ee2343ce59800');
      expect(result.body.message).to.be.equal('User not found');
      expect(result.status).to.be.equal(404);
    });

    it('should update and return the user for the passed id', async () => {
      const user = new User({
        username: 'user',
        email: 'test@test.com',
        password: 'password',
      });
      await user.save();

      const result = await chai.request(app).delete(`/api/users/${user._id}`);
      expect(result.status).to.be.equal(204);
    });
  });

  describe('POST api/users/follow', () => {
    it('should follow user successfully', async () => {
      const sender = new User({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password',
      });
      await sender.save();

      const recipient = new User({
        username: 'recipient',
        email: 'recipient@test.com',
        password: 'password',
      });
      await recipient.save();

      const followUserStub = Sinon.stub(userService, 'followUser').resolves(
        true,
      );

      const response = await chai
        .request(app)
        .post('/api/users/follow')
        .send({ userId: sender._id, recipientId: recipient._id });

      expect(response.status).to.be.equal(204);

      followUserStub.restore();
    });

    it('should return bad request', async () => {
      const followUserStub = Sinon.stub(userService, 'followUser').resolves(
        false,
      );

      const response = await chai
        .request(app)
        .post('/api/users/follow')
        .send({
          userId: '56cb91bdc3464f14678934ca',
          recipientId: '56cb91bdc3464f14678934ca',
        });

      expect(response.status).to.be.equal(400);
      followUserStub.restore();
    });
  });
});

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
