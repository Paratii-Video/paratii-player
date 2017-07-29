import { getUserPTIAddress } from '/imports/api/users.js';
import './transactions.html';


const moment = require('moment');
const Transactions = new Mongo.Collection('transactions');


Template.transactions.onCreated(function () {
  const userPTIAddress = getUserPTIAddress();
  Meteor.subscribe('userTransactions', userPTIAddress);
});


Template.registerHelper('formatDate', function (timestamp) {
  return moment(timestamp).format('YYYY/M/D H:mm:ss');
});

Template.transactions.helpers({
  transactions() {
    return Transactions.find({}, { sort: { blockNumber: -1 } });
    // return Session.get('transactions') || [];
  },
  userPTIAddress() {
    return getUserPTIAddress();
  },
});
