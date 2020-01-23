import express, { Application } from 'express';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import bcrypt from 'bcryptjs';

import * as middlewares from '../../src/middlewares';
import { RequestWithUser } from '../../src/interfaces';
import App from '../../src/app';
import AuthController from '../../src/controllers/auth.controller';
import AuthService from '../../src/services/auth.service';
import User from '../../src/models/user.model';

let app: Application;
let authenticateStub: Sinon.SinonStub<
  [express.Request, express.Response, express.NextFunction],
  Promise<void>
>;

chai.use(chaiHttp);
const authService = new AuthService();

describe('Auth controller', () => {
  before(() => {
    authenticateStub = Sinon.stub(middlewares, 'isAuthenticated').callsFake(
      async (
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction,
      ): Promise<void> => {
        (req as RequestWithUser).user = new User({
          username: 'admin',
          email: 'admin@admin.com',
        });
        next();
      },
    );
    app = new App([new AuthController(authService)]).app;
  });

  after(() => {
    authenticateStub.restore();
  });

  describe('POST api/auth/register', () => {
    it('should register the user successfully', async () => {
      const response = await chai
        .request(app)
        .post('/api/auth/register')
        .send({
          username: 'test',
          email: 'test@test.com',
          password: 'password',
        });
      expect(response.status).to.be.equal(200);
      expect(response.body).to.deep.include({
        username: 'test',
        email: 'test@test.com',
      });
    });

    it('should throw validation errors', async () => {
      const user = new User({
        username: 'test',
        email: 'test1@test.com',
        password: 'passsword',
      });
      await user.save();

      const response = await chai
        .request(app)
        .post('/api/auth/register')
        .send({
          username: 'test',
          email: 'test',
          password: 'password!',
        });

      expect(response.status).to.be.equal(422);
      expect(response.body.errors.length).to.be.equal(3);
      expect(response.body.errors[0]).to.deep.include({
        value: 'test',
        msg: 'This username is already taken',
        param: 'username',
        location: 'body',
      });
      expect(response.body.errors[1]).to.deep.include({
        value: 'test',
        msg: 'You should pass a valid email',
        param: 'email',
        location: 'body',
      });
      expect(response.body.errors[2]).to.deep.include({
        value: 'password!',
        msg: 'The password should have only alphanumerical characters',
        param: 'password',
        location: 'body',
      });
    });
  });

  describe('POST api/auth/login', () => {
    it('should login the user successfully and return it with jwtToken', async () => {
      const compareStub = Sinon.stub(bcrypt, 'compare').resolves(true);

      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      const response = await chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: 'password',
        });

      expect(response.status).to.be.equal(200);
      expect(response.body).to.deep.include({
        username: 'test',
        email: 'test@test.com',
        followers: [],
        followed: [],
      });

      expect(response.body.jwtToken).to.be.string;
      compareStub.restore();
    });

    it('should not find the user passed for the login', async () => {
      const response = await chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: 'password',
        });

      expect(response.status).to.be.equal(404);
      expect(response.body).to.deep.equal({
        status: 404,
        message: 'User not found',
      });
    });

    it('should throw bad credentials exception', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      const response = await chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: 'wrongPassword',
        });

      expect(response.status).to.be.equal(401);
      expect(response.body).to.deep.equal({
        status: 401,
        message:
          'A user with this username/password combination does not exist',
      });
    });

    it('should throw validation exception', async () => {
      const response = await chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username: 't',
          password: 'wrong',
        });

      expect(response.status).to.be.equal(422);
      expect(response.body.errors[0]).to.deep.equal({
        value: 't',
        msg: 'The username should have at least 3 characters',
        param: 'username',
        location: 'body',
      });
      expect(response.body.errors[1]).to.deep.equal({
        value: 'wrong',
        msg: 'The password should have at least 6 characters',
        param: 'password',
        location: 'body',
      });
    });
  });
});

//     it('should not find a user', async () => {
//       const req = {
//         body: { username: 'testuser', password: 'password' },
//       };

//       const res = { json: (data) => data };

//       return authController
//         .login(req, res, () => {})
//         .then(() => {
//           throw new Error('This should throw error');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal('User not found');
//           expect(err.statusCode).to.be.equal(404);
//         });
//     });

//     it('should throw error for incorrect credentials', async () => {
//       const req = {
//         body: { username: 'testuser', password: 'password' },
//       };

//       const res = { json: (data) => data };

//       const user = new User({ ...req.body, email: 'testuser@test.com' });
//       try {
//         await user.save();
//       } catch (error) {
//         throw error;
//       }

//       return authController
//         .login(req, res, () => {})
//         .then(() => {
//           throw new Error('This should throw error');
//         })
//         .catch((err) => {
//           expect(err.message).to.be.equal(
//             'This username/password combination does not exist',
//           );
//           expect(err.statusCode).to.be.equal(401);
//         });
//     });
//   });
// });
