import { expect } from 'chai';
import sinon from 'sinon';

import User from '../../src/models/user.model';
import UserService from '../../src/services/user.service';

const userService = new UserService();

describe('User service', () => {
  describe('Get users', () => {
    it('should return empty array of users', () => {
      const stub = sinon.stub(User, 'find').resolves([]);

      return userService
        .getUsers()
        .then((result) => {
          expect(result).to.be.eql([]);
        })
        .finally(() => {
          stub.restore();
        });
    });
  });

  describe('Get user by id', () => {
    it('should return the found user passing the right id', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      return userService.getUserById(user._id).then((result) => {
        expect(result).to.deep.include({ username: 'test' });
      });
    });

    it('should return null for the passed id', async () => {
      return userService
        .getUserById('5e24c8036ef40628a5b21138')
        .then((result) => {
          expect(result).to.be.a('null');
        })
        .catch((error) => {
          throw error;
        });
    });
  });

  describe('Update user by id', () => {
    it('should update the user correctly', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      return userService
        .updateUser(user._id, { username: 'testModified' })
        .then((result) => {
          expect(result).to.deep.include({
            username: 'testmodified',
            email: 'test@test.com',
          });
        });
    });

    it('should return null for the passed id', async () => {
      return userService
        .updateUser('5e24c8036ef40628a5b21138', {})
        .then((result) => {
          expect(result).to.be.a('null');
        })
        .catch((error) => {
          throw error;
        });
    });
  });

  describe('Delete user by id', () => {
    it('should delete the user correctly', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });

      await user.save();

      return userService.deleteUser(user._id).then((result) => {
        expect(result).to.be.true;
      });
    });

    it('should return null for the passed id', async () => {
      return userService
        .deleteUser('5e24c8036ef40628a5b21138')
        .then((result) => {
          expect(result).to.be.false;
        });
    });
  });
});
