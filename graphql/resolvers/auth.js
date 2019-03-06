const User = require('../../models/user');
const bcrypt = require('bcryptjs');

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
  }
};
