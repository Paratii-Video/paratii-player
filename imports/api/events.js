import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Events = new Mongo.Collection('events');

if (Meteor.isServer) {
  Meteor.methods({
    'events.sendPTI'(data) {
      check(data, Object); // Check the type of the data

      if (Meteor.users.findOne({ 'profile.ptiAddress': data.receiver }) === undefined) {
        // TODO Error Notification
        return;
      }
      if (data.sender === data.receiver) {
        // TODO Error Notification
        return;
      }

      Events.insert({
        sender: data.sender,
        receiver: data.receiver,
        description: data.description,
        amount: data.amount,
        createdAt: new Date(),
      });
      // TODO success insert notification
    },
  });

  Meteor.publish('userTransactions', function (userPTIaddress) {
    check(userPTIaddress, String);
    // Publish all transactions where I find userPTIAddress
    return Events.find({ $or: [{ sender: userPTIaddress }, { receiver: userPTIaddress }] });
  });
}
