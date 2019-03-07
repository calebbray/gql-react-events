const { dateToString } = require('../../helpers/date');

const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  async events() {
    try {
      const events = await Event.find();
      return events.map(event => transformEvent(event));
    } catch (err) {
      throw err;
    }
  },

  async createEvent(args, req) {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    const event = new Event({
      title: args.data.title,
      description: args.data.description,
      price: +args.data.price,
      date: dateToString(args.data.date),
      creator: req.userId
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);

      const creator = await User.findById(req.userId);
      if (!creator) {
        throw new Error('A user with that ID does not exist');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  }
};
