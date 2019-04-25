const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const { dateToString } = require('../../helpers/date');

const transformEvent = event => {
  return {
    ...event._doc,
        creator: user.bind(this, event.creator),
        date: dateToString(event._doc.date)
  };
};

const events = async eventIds => {
  try {
    const events = await Event.find({
      _id: { $in: eventIds }
    });
   return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try{
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch(err) {
    throw err;
  }
}

const user = async userID => {
  try {
    const user = await User.findById(userID);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },

  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return{
          ...booking._doc,
          user: user.bind(this, booking._doc.user),
          event:singleEvent.bind(this, booking._doc.event),
          createdAt: dateToString(booking._doc.createdAt),
          updatedAt: dateToString(booking._doc.updatedAt),
        };
      })
    } catch (err) {
      throw err
    }
  },

  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: "5cc01b12ed08b510f9be777a"
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById("5cc01b12ed08b510f9be777a");
      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async args => {
    try {
      const existingUser = await  User.findOne({ email: args.userInput.email })
          if (existingUser) {
            throw new Error("User exist already.");
          }
     const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });
          const result = await user.save();
          return { ...result._doc, password: null };
        } catch (err) {
          throw err;
        }
  },

  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({_id: args.eventId})
    const booking = new Booking({
      user: "5cc01b12ed08b510f9be777a",
      event: fetchedEvent
    });

    const result = await booking.save();
    return {
      ...result._doc,
      user: user.bind(this, booking._doc.user),
      event:singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
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
