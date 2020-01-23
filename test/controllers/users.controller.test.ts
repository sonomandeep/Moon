import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import express, { NextFunction, Response, Application } from 'express';

import App from '../../src/app';
import UsersController from '../../src/controllers/users.controller';
import UserService from '../../src/services/user.service';
import User from '../../src/models/user.model';
import * as middlewares from '../../src/middlewares';
import { RequestWithUser } from '../../src/interfaces';

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
        (req as RequestWithUser).user = new User({
          username: 'admin',
          email: 'admin@admin.com',
        });
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
      const response = await chai.request(app).get('/api/users');
      expect(response.body).to.be.eql([]);
      expect(response.status).to.be.equal(200);
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

      const result = await chai.request(app).get('/api/users?limit=5&skip=3');
      expect(result.body.length).to.be.equal(2);
      expect(result.body[0]).to.not.deep.include({
        username: 'user0',
        email: 'test0@test.com',
      });
      expect(result.body[1]).to.deep.include({
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
        .send({
          recipientId: recipient._id,
        });

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
          recipientId: '56cb91bdc3464f14678934ca',
        });

      expect(response.status).to.be.equal(400);
      followUserStub.restore();
    });
  });

  describe('POST api/users/unfollow', () => {
    it('should unfollow user successfully', async () => {
      const recipient = new User({
        username: 'recipient',
        email: 'recipient@test.com',
        password: 'password',
      });
      await recipient.save();

      const unfollowUserStub = Sinon.stub(userService, 'unfollowUser').resolves(
        true,
      );

      const response = await chai
        .request(app)
        .post('/api/users/unfollow')
        .send({
          recipientId: recipient._id,
        });

      expect(response.status).to.be.equal(204);
      unfollowUserStub.restore();
    });

    it('should return bad request', async () => {
      const unfollowUserStub = Sinon.stub(userService, 'unfollowUser').resolves(
        false,
      );

      const response = await chai
        .request(app)
        .post('/api/users/unfollow')
        .send({
          recipientId: '56cb91bdc3464f14678934ca',
        });

      expect(response.status).to.be.equal(400);
      unfollowUserStub.restore();
    });
  });
});
