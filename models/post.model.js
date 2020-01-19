const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      maxlenght: 512,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Post', postSchema);
