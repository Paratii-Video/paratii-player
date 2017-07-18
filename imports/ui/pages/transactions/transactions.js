import { getUserPTIAddress } from '/imports/api/users.js';

import './transactions.html';

const moment = require('moment');


Template.transactions.onCreated(function () {
//   Meteor.subscribe('transactions');
});


Template.registerHelper('formatDate', function (timestamp) {
  return moment(timestamp).format('YYYY/M/D H:mm:ss');
});

Template.transactions.helpers({
  transactions() {
    return Session.get('transactions') || [];
  },
  userPTIAddress() {
    return getUserPTIAddress();
  },
});
