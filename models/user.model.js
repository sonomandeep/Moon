const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
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
  followers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  followed: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', userSchema);
