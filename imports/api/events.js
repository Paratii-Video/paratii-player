import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Events = new Mongo.Collection('events');

export function getBalance(userPTIaddress) {
  let lastTransaction = {};
  let balance;
  const query = { $or: [{ sender: userPTIaddress }, { receiver: userPTIaddress }] };
  const args = { sort: { $natural: -1 } };
  lastTransaction = Events.find(query, args).fetch()[0];
  if (lastTransaction === undefined) {
    return 0;
  }
  if (lastTransaction.sender === userPTIaddress) {
    balance = lastTransaction.senderBalance;
  } else {
    balance = lastTransaction.receiverBalance;
  }
  return balance;
}

if (Meteor.isServer) {
  Meteor.methods({
    'events.sendPTI'(data) {
      check(data, Object); // Check the type of the data
      const senderBal = parseFloat(getBalance(data.sender)) - parseFloat(data.amount);
      const receiverBal = parseFloat(getBalance(data.receiver)) + parseFloat(data.amount);
      const amountVal = parseFloat(data.amount);
      if (Meteor.users.findOne({ 'profile.ptiAddress': data.receiver }) === undefined) {
        // TODO Error Notification
        throw new Meteor.Error('ptiAddress-not-found', 'Can\'t find the Reciver PTIAddress');
      }
      if (data.sender === data.receiver) {
        // TODO Error Notification
        throw new Meteor.Error('same-ptiAddress', 'The sender is trying to send PTI to itself');
      }
      if (senderBal < amountVal) {
        // TODO Error Notification
        throw new Meteor.Error('low-amount', 'The personal amount is too low for thi operation');
      }

      Events.insert({
        sender: data.sender,
        receiver: data.receiver,
        description: data.description,
        senderBalance: senderBal,
        receiverBalance: receiverBal,
        amount: amountVal,
        createdAt: new Date(),
      });
      // TODO success insert notification
    },
    'events.balance'(userPTIaddress) {
      check(userPTIaddress, String);
      return getBalance(userPTIaddress);
    },
  });

  Meteor.publish('userTransactions', function (userPTIaddress) {
    check(userPTIaddress, String);
    // Publish all transactions where I find userPTIAddress
    const query = { $or: [{ sender: userPTIaddress }, { receiver: userPTIaddress }] };
    const args = { sort: { $natural: -1 } };
    return Events.find(query, args);
  });
}
