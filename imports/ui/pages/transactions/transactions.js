import { getUserPTIAddress } from '/imports/api/users.js';
import { Transactions } from '/imports/api/transactions.js';
import './transactions.html';


const moment = require('moment');


Template.transactions.onCreated(function () {
  const userPTIAddress = getUserPTIAddress();
  Meteor.subscribe('userTransactions', userPTIAddress);
});


Template.registerHelper('formatDate', function (timestamp) {
  return moment(timestamp).format('YYYY/M/D H:mm:ss');
});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});

Template.registerHelper('toEther', function (a) {
  return parseFloat(web3.fromWei(a, 'ether'));
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
