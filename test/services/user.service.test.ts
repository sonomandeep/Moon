/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai';
import sinon from 'sinon';

import User from '../../src/models/user.model';
import UserService from '../../src/services/user.service';

const userService = new UserService();

describe('User service', () => {
  describe('Get users', () => {
    it('should return empty array of users', async () => {
      const stub = sinon.stub(User, 'find').resolves([]);

      const result = await userService.getUsers({ limit: 20, skip: 0 });
      expect(result).to.be.eql([]);

      stub.restore();
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

      const result = await userService.getUserById(user._id);

      expect(result).to.deep.include({ username: 'test' });
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

  describe('Follow user', () => {
    it('should follow user successfully', async () => {
      const sender = new User({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password',
      });
      await sender.save();

      const recipient = new User({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password',
      });
      await recipient.save();

      const result = await userService.followUser(sender._id, recipient._id);

      const foundSender = await User.findById(sender._id);
      const foundRecipient = await User.findById(recipient._id);

      expect(result).to.be.true;
      expect(foundSender!.followed[0].toString()).to.be.equal(
        recipient._id.toString(),
      );
      expect(foundRecipient!.followers[0].toString()).to.be.equal(
        sender._id.toString(),
      );
    });

    it('should not find users and return false', async () => {
      const result = await userService.followUser(
        '5e2732d720d9254c40ab4200',
        '5e2732d720d9254c40ab4201',
      );

      expect(result).to.be.false;
    });
  });

  describe('Unfollow user', () => {
    it('should unfollow user successfully', async () => {
      const sender = new User({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password',
      });
      await sender.save();

      const recipient = new User({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password',
      });
      await recipient.save();
      await userService.followUser(sender._id, recipient._id);

      const result = await userService.unfollowUser(sender._id, recipient._id);

      const foundSender = await User.findById(sender._id);
      const foundRecipient = await User.findById(recipient._id);

      expect(result).to.be.true;
      expect(foundSender!.followed).to.be.empty;
      expect(foundRecipient!.followers).to.be.empty;
    });

    it('should not find users and return false', async () => {
      const result = await userService.unfollowUser(
        '5e2732d720d9254c40ab4200',
        '5e2732d720d9254c40ab4201',
      );

      expect(result).to.be.false;
    });
  });
});
