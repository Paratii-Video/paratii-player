import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Session } from 'meteor/session';

export const Events = new Mongo.Collection('events');

if(Meteor.isServer){
  Meteor.methods({
    'events.sendPTI'(data) {
      check(data, Object); // Check the type of the data
      Events.insert({
        sender: data.sender,
        receiver: data.receiver,
        description: data.description,
        amount: data.amount,
        createdAt: new Date()
      });

      return true;
    }
  });
};
