import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser } from '../models/user.model';

export default class AuthService {
  public static generateToken(user: IUser) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '10h',
    });
  }

  public static verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  }

  public static async hashPassword(password: string) {
    const hash = await bcrypt.hash(password, 12);
    return hash;
  }
}

export const generateToken = (user: IUser) => {
  throw new Error('Deprecated');
};

export const verifyToken = (token: string) => {
  throw new Error('Deprecated');
};

export const hashPassword = async (password: string) => {
  throw new Error('Deprecated');
};
