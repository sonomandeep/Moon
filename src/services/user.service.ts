import User, { UserInterface } from '../models/user.model';
import AuthService from '../services/auth.service';
import UpdateUserDto from '../dtos/user/updateUser.dto';

interface UserServiceInterface {
  getUsers(): Promise<UserInterface[]>;
  getUserById(id: string): Promise<UserInterface | null>;
  updateUser(id: string, user: UserInterface): Promise<UserInterface | null>;
  deleteUser(id: string): Promise<boolean>;
}

class UserService implements UserServiceInterface {
  public async getUsers(): Promise<UserInterface[]> {
    return User.find();
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
}

export default new UserService();
