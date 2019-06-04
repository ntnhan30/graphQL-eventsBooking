const DataLoader = require('dataloader')

const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader((eventIds) => {
  return events(eventIds) ;
});

const userLoader = new DataLoader( userIds => {
  return User.find({_id: {$in: userIds}});
})

const events = async eventIds => {
    try {
      const events = await Event.find({
        _id: { $in: eventIds }
      });
      // order the events to macth with eventIds
      events.sort((a,b) => {
        return (
          eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
        )
      });
      console.log(events, eventIds)
     return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  };
  
  const singleEvent = async eventId => {
    try{
      const event = await eventLoader.load(eventId.toString());
      return event;
    } catch(err) {
      throw err;
    }
  }
  
  const user = async userID => {
    try {
    // here we get userID as object eventhough it is not shown as an object
    // and in JS Objects are not equal even they hold the same value in JS
    //So we have to convert them to string so that Data Loader won't return duplicated data
      const user = await userLoader.load(userID.toString());
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
      };
    } catch (err) {
      throw err;
    }
  };

  const transformEvent = event => {
    return {
      ...event._doc,
      _id: event.id,
          creator: user.bind(this, event.creator),
          date: dateToString(event._doc.date)
    };
  };

  const transformBooking = booking =>{
    return {
      ...booking._doc,
      _id: booking.id,
      user: user.bind(this, booking._doc.user),
      event:singleEvent.bind(this, booking._doc.event),
      createdAt: dateToString(booking._doc.createdAt),
      updatedAt: dateToString(booking._doc.updatedAt),
    }
  };
  
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
//   exports.user = user;
//   exports.events = events;
//   exports.singleEvent = singleEvent;

