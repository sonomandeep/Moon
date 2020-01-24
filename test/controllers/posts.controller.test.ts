import express, { NextFunction, Response, Application } from 'express';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import sinon from 'sinon';

import * as middlewares from '../../src/middlewares';
import PostService from '../../src/services/post.service';
import User from '../../src/models/user.model';
import Post from '../../src/models/post.model';
import { RequestWithUser } from '../../src/interfaces/requests';
import PostsController from '../../src/controllers/posts.controller';
import App from '../../src/app';

let app: Application;
let authenticateStub: Sinon.SinonStub<
  [express.Request, express.Response, express.NextFunction],
  Promise<void>
>;

chai.use(chaiHttp);
const postService = new PostService();

describe('Posts controller', () => {
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
    app = new App([new PostsController(postService)]).app;
  });

  after(() => {
    authenticateStub.restore();
  });

  describe('GET api/posts', () => {
    it('should return an array of posts', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });
      await user.save();

      for (let i = 0; i < 5; i++) {
        const post = new Post({ description: `Post ${i}`, user: user._id });
        await post.save();
      }

      const response = await chai.request(app).get('/api/posts?limit=2&skip=2');

      expect(response.status).to.be.equal(200);
      expect(response.body.length).to.be.equal(2);
      expect(response.body[0]).to.deep.include({
        description: 'Post 2',
        user: user._id.toString(),
      });
      expect(response.body[1]).to.deep.include({
        description: 'Post 3',
        user: user._id.toString(),
      });
    });
  });

  describe('GET api/posts/:id', () => {
    it('should return the post for the passed id', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });
      await user.save();

      const post = new Post({ description: 'Post', user: user._id });
      await post.save();

      const response = await chai
        .request(app)
        .get(`/api/posts/${post._id.toString()}`);

      expect(response.status).to.be.equal(200);
      expect(response.body).to.deep.include({
        description: 'Post',
        user: user._id.toString(),
      });
    });

    it('should throw post not found exception', async () => {
      const response = await chai
        .request(app)
        .get('/api/posts/5e2b0c4f56b0ff51000b5138');

      expect(response.status).to.be.equal(404);
      expect(response.body.message).to.be.equal('Post not found');
    });

    it('should throw id validation error', async () => {
      const response = await chai.request(app).get('/api/posts/wrong');

      expect(response.status).to.be.equal(422);
      expect(response.body.errors[0]).to.deep.equal({
        value: 'wrong',
        msg: 'You must pass a valid id',
        param: 'id',
        location: 'params',
      });
    });
  });

  describe('POST api/posts', () => {
    it('should create the post successfully', async () => {
      const response = await chai
        .request(app)
        .post('/api/posts')
        .send({ description: 'Post' });

      expect(response.status).to.be.equal(200);
      expect(response.body.description).to.be.equal('Post');
    });

    it('should throw validation exception', async () => {
      const response = await chai.request(app).post('/api/posts');

      expect(response.status).to.be.equal(422);
      expect(response.body.errors[0]).to.deep.equal({
        msg: 'You must pass a description.',
        param: 'description',
        location: 'body',
      });
    });
  });

  describe('PATCH api/posts/:id', () => {
    it('should update the post successfully', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      const post = new Post({
        description: 'Modified',
        user: user._id,
      });

      const updatePostStub = sinon
        .stub(postService, 'updatePost')
        .resolves(post);

      const response = await chai
        .request(app)
        .patch(`/api/posts/5e2b0c4f56b0ff51000b5138`)
        .send({ description: 'Modified' });

      expect(response.status).to.be.equal(200);
      expect(response.body.description).to.be.equal('Modified');
      updatePostStub.restore();
    });

    it('should throw validation exception', async () => {
      const response = await chai.request(app).patch('/api/posts/wrong');

      expect(response.status).to.be.equal(422);
      expect(response.body.errors[0]).to.deep.equal({
        value: 'wrong',
        msg: 'You must pass a valid id',
        param: 'id',
        location: 'params',
      });
    });

    it('should throw post not found exception', async () => {
      const response = await chai
        .request(app)
        .patch('/api/posts/5e2b0c4f56b0ff51000b5138');

      expect(response.status).to.be.equal(404);
      expect(response.body.message).to.be.equal('Post not found');
    });
  });

  describe('DELETE api/posts/:id', () => {
    it('should delete the post successfully', async () => {
      const deletePostStub = sinon
        .stub(postService, 'deletePost')
        .resolves(true);

      const response = await chai
        .request(app)
        .delete(`/api/posts/5e2b0c4f56b0ff51000b5138`);

      expect(response.status).to.be.equal(204);
      deletePostStub.restore();
    });

    it('should throw validation exception', async () => {
      const response = await chai.request(app).delete('/api/posts/wrong');

      expect(response.status).to.be.equal(422);
      expect(response.body.errors[0]).to.deep.equal({
        value: 'wrong',
        msg: 'You must pass a valid id',
        param: 'id',
        location: 'params',
      });
    });

    it('should throw post not found exception', async () => {
      const response = await chai
        .request(app)
        .patch('/api/posts/5e2b0c4f56b0ff51000b5138');

      expect(response.status).to.be.equal(404);
      expect(response.body.message).to.be.equal('Post not found');
    });
  });
});
