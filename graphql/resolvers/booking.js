const { transformBooking } = require('./merge');

const Booking = require('../../models/booking');
const Event = require('../../models/event');

module.exports = {
  async bookings(args, req) {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => transformBooking(booking));
    } catch (err) {
      throw err;
    }
  },

  async bookEvent(args, req) {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    const eventExists = await Event.findOne({ _id: args.eventId });

    if (!eventExists) {
      throw new Error('Event not Found');
    }

    const booking = new Booking({
      user: req.userId,
      event: eventExists
    });

    const result = await booking.save();
    return transformBooking(result);
  },

  async cancelBooking(args, req) {
    if (!req.isAuth) {
      throw new Error('Not Authenticated');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      if (!booking) {
        throw new Error('Booking not Found');
      }
      await Booking.deleteOne({ _id: args.bookingId });
      return transformEvent(booking.event);
    } catch (err) {
      throw err;
    }
  }
};
