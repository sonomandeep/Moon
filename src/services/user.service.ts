import User, { UserInterface } from '../models/user.model';
import UpdateUserDto from '../dtos/user/updateUser.dto';
import mongoose from 'mongoose';
import { PaginationOptions } from '../interfaces';

export interface UserServiceInterface {
  getUsers(options: PaginationOptions): Promise<UserInterface[]>;
  getUserById(id: string): Promise<UserInterface | null>;
  updateUser(id: string, user: UpdateUserDto): Promise<UserInterface | null>;
  deleteUser(id: string): Promise<boolean>;
  followUser(id: string, recipientId: string): Promise<boolean>;
  unfollowUser(id: string, recipientId: string): Promise<boolean>;
}

class UserService implements UserServiceInterface {
  public async getUsers(options: PaginationOptions): Promise<UserInterface[]> {
    return User.find({}, {}, { skip: options.skip, limit: options.limit });
  }

  public async getUserById(id: string): Promise<UserInterface | null> {
    return User.findById(id);
  }

  public async updateUser(
    id: string,
    update: UpdateUserDto,
  ): Promise<UserInterface | null> {
    const updated = await User.findOneAndUpdate({ _id: id }, update, {
      new: true,
    });

    return updated;
  }

  public async deleteUser(id: string): Promise<boolean> {
    const deleted = await User.findByIdAndDelete(id);

    return !!deleted;
  }

  public async followUser(id: string, recipientId: string): Promise<boolean> {
    const recipient = await User.findById(recipientId);
    const sender = await User.findById(id);
    if (!recipient || !sender) {
      return false;
    }

    // TODO: write an helper function for convert string to objectIds
    recipient.followers.push(mongoose.Types.ObjectId(id));
    await recipient.save();

    sender.followed.push(mongoose.Types.ObjectId(recipientId));
    await sender.save();

    return true;
  }

  public async unfollowUser(id: string, recipientId: string): Promise<boolean> {
    const recipient = await User.findById(recipientId);
    const sender = await User.findById(id);
    if (!recipient || !sender) {
      return false;
    }

    recipient.followers = recipient.followers.filter((element) => {
      return element.toHexString() !== id.toString();
    });
    await recipient.save();

    sender.followed = sender.followed.filter((element) => {
      return element.toHexString() !== recipientId.toString();
    });
    await sender.save();

    return true;
  }
}

export default UserService;
