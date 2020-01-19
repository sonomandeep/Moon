import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  jwtToken: string;
  followers: mongoose.Types.ObjectId[];
  followed: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlenght: 3,
    maxlenght: 32,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlenght: 6,
    maxlenght: 256,
  },
  jwtToken: {
    type: String,
    trim: true,
  },
  followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  followed: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model<IUser>('User', userSchema);
