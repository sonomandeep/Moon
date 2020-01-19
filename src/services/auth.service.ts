import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserInterface } from '../models/user.model';

export default class AuthService {
  public static generateToken(user: UserInterface): string {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '10h',
    });
  }

  public static verifyToken(token: string): string | object {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  }

  public static async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 12);
    return hash;
  }
}
