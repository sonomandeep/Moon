const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '10h',
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, 12);
  return hash;
};
