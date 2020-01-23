import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from '../models/user.model';
import { UserInterface } from '../models/user.model';
import RegisterUserDto from '../dtos/user/registerUser.dto';
import LoginUserDto from '../dtos/user/loginUser.dto';
import NotFoundException from '../exceptions/notFound.exception';
import BadCredentialsException from '../exceptions/badCredentials.exception';
import { InternalServerError } from '../exceptions';

export interface AuthServiceInterface {
  register(registerUserDto: RegisterUserDto): Promise<UserInterface>;
  login(loginUserDto: LoginUserDto): Promise<UserInterface>;
}

export default class AuthService implements AuthServiceInterface {
  /**
   * register
   */
  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<UserInterface> {
    const hashedPassword = await this.hashPassword(registerUserDto.password);
    const user = new User({
      username: registerUserDto.username,
      password: hashedPassword,
      email: registerUserDto.email,
    });
    await user.save();

    const found = await User.findById(user.id).select('_id email username');

    if (!found) {
      throw new InternalServerError();
    }

    return found;
  }

  /**
   * login
   */
  public async login(loginUserDto: LoginUserDto): Promise<UserInterface> {
    const user = await User.findOne({ username: loginUserDto.username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordCheckResult = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!passwordCheckResult) {
      throw new BadCredentialsException(
        'A user with this username/password combination does not exist',
      );
    }

    const token = this.generateToken(user);
    user.jwtToken = token;
    await user.save();

    const found = await User.findById(user.id).select(
      '_id email username jwtToken followers followed',
    );

    if (!found) {
      throw new InternalServerError();
    }

    return found;
  }

  public generateToken(user: UserInterface): string {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '10h',
    });
  }

  public static verifyToken(token: string): string | object {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 12);
    return hash;
  }
}
