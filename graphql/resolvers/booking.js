const { transformBooking } = require('./merge');

const Booking = require('../../models/booking');
const Event = require('../../models/event');

module.exports = {
  async bookings() {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => transformBooking(booking));
    } catch (err) {
      throw err;
    }
  },

  async bookEvent(args) {
    const eventExists = await Event.findOne({ _id: args.eventId });

    if (!eventExists) {
      throw new Error('Event not Found');
    }

    const booking = new Booking({
      user: '5c7cd3ec13460c04a82df986',
      event: eventExists
    });

    const result = await booking.save();
    return transformBooking(result);
  },

  async cancelBooking(args) {
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
