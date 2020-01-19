import User, { IUser } from '../models/user.model';
import AuthService from '../services/auth.service';

interface IUserService {
  getUsers(): Promise<IUser[]>;
  getUserById(id: string): Promise<IUser | null>;
  updateUser(id: string, user: IUser): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export default class UserService implements IUserService {
  constructor() {}

  public async getUsers(): Promise<IUser[]> {
    return await User.find();
  }

  public async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  public async updateUser(id: string, user: IUser): Promise<IUser | null> {
    const updateArray = Object.keys(user);
    let update = {};
    updateArray.forEach((element: string) => {
      if (element === 'password') {
        update = {
          ...update,
          [element]: AuthService.hashPassword(user[element]),
        };
      } else {
        update = { ...update, [element]: user[element] };
      }
    });

    const updated = await User.findOneAndUpdate({ _id: id }, update, {
      new: true,
    });

    return updated;
  }
  public async deleteUser(id: string): Promise<boolean> {
    const deleted = await User.findByIdAndDelete(id);

    return !!deleted;
  }
}
