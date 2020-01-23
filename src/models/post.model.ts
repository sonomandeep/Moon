import mongoose from 'mongoose';

export interface PostInterface extends mongoose.Document {
  description: string;
  user: mongoose.Types.ObjectId;
}

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      maxlenght: 512,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export default mongoose.model<PostInterface>('Post', postSchema);
