const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  async createUser(args) {
    try {
      const existingUser = await User.findOne({ email: args.data.email });

      if (existingUser) {
        throw new Error('User with that email already exists');
      }

      const hashPass = await bcrypt.hash(args.data.password, 12);
      const user = new User({
        email: args.data.email,
        password: hashPass
      });

      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (err) {
      throw err;
    }
  },

  async login({ email, password }) {
    try {
      const user = await User.findOne({ email });
      const hashPass = await bcrypt.compare(password, user.password);
      if (!user || !hashPass) {
        throw new Error('Unable to login');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'secret1',
        { expiresIn: '1h' }
      );

      return {
        userId: user.id,
        token,
        tokenExpiration: 1
      };
    } catch (err) {
      throw err;
    }
  }
};
