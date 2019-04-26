
const Event = require ("../../models/event")
const Booking = require("../../models/booking");
const {transformBooking} = require('./merge')

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      console.log(bookings)
      return bookings.map(booking => {
        return transformBooking(booking);
      })
    } catch (err) {
      throw err
    }
  },

  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({_id: args.eventId})
    const booking = new Booking({
      user: "5cc01b12ed08b510f9be777a",
      event: fetchedEvent
    });

    const result = await booking.save();
    return transformBooking(result);
  },

  cancelBooking: async args => {
    try {
     const booking = await Booking.findById(args.bookingId).populate('event');
     console.log(args)
     const event = transformEvent(booking.event);
     await Booking.deleteOne({_id: args.bookingId});
     return event;
    } catch (err) {
      throw err
    }
  }
};
