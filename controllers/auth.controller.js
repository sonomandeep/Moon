exports.register = async (req, res, next) => {
  return res.json({ id: 1, username: 'testuser', email: 'testuser@test.com' });
};
