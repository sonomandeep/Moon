import express, { Application } from 'express';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';

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
});

// const { expect } = require('chai');
// const sinon = require('sinon');
// const bcrypt = require('bcryptjs');

// const authController = require('../../controllers/auth.controller');
// const User = require('../../models/user.model');

// describe('Auth controller', () => {
//   describe('Register', () => {
//     it('should create new user', async () => {
//       const req = {
//         body: {
//           username: 'testuser',
//           email: 'testuser@test.com',
//           password: 'password',
//         },
//       };
//       const res = { json: (data) => data };

//       return authController
//         .register(req, res, () => {})
//         .then(({ id, username, email }) => {
//           expect(id).to.not.be.null;
//           expect(username).to.be.equal('testuser');
//           expect(email).to.be.equal('testuser@test.com');
//         })
//         .catch((err) => {
//           throw err;
//         });
//     });
//   });

//   describe('Login', () => {
//     it('should login successfully', async () => {
//       sinon.stub(bcrypt, 'compare').returns(true);

//       const req = {
//         body: { username: 'testuser', password: 'password' },
//       };

//       const res = { json: (data) => data };

//       const user = new User({
//         username: 'testuser',
//         password: 'password',
//         email: 'testuser@test.com',
//       });
//       try {
//         await user.save();
//       } catch (error) {
//         throw error;
//       }

//       return authController
//         .login(req, res, () => {})
//         .then((result) => {
//           expect(result.jwtToken).to.be.not.null;
//           expect(result.user._id).to.be.not.null;
//           expect(result.user.username).to.be.equal('testuser');
//           expect(result.user.email).to.be.equal('testuser@test.com');
//         })
//         .catch((err) => {
//           console.log('ERRORE');
//           throw err;
//         })
//         .finally(() => {
//           bcrypt.compare.restore();
//         });
//     });

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
