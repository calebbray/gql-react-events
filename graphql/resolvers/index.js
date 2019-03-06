const bcrypt = require('bcryptjs');

const User = require('../../models/user');
const Event = require('../../models/event');

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => ({
      ...event._doc,
      date: new Date(event._doc.date).toISOString(),
      creator: user.bind(this, event.creator)
    }));
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  async events() {
    try {
      const events = await Event.find();
      return events.map(event => ({
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      }));
    } catch (err) {
      throw err;
    }
  },

  async createEvent(args) {
    const event = new Event({
      title: args.data.title,
      description: args.data.description,
      price: +args.data.price,
      date: new Date(args.data.date),
      creator: '5c7cd3ec13460c04a82df986'
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };

      const creator = await User.findById('5c7cd3ec13460c04a82df986');
      if (!creator) {
        throw new Error('A user with that ID does not exist');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  },

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
