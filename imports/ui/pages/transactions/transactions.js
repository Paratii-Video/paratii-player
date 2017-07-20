import './transactions.html';

const moment = require('moment');
// Template.transactions.onCreated(function () {
//   Meteor.subscribe('transactions');
// });
Template.registerHelper('formatDate', function (timestamp) {
  return moment(timestamp).format('YYYY/M/D H:mm:ss');
  // return moment(timestamp).fromNow();
});

Template.transactions.helpers({
  transactions() {
    return [
      {
        id: '0x..',
        description: 'You have been SOOOO rewared',
        amount_eth: 50.2324,
        amount_pti: 3.21,
        datetime: new Date(2017, 7, 16, 17, 55, 1),
      },
      {
        id: '0x..',
        description: 'Monthly Subscription to vidoes of Your Own Cat',
        amount_eth: 0,
        amount_pti: -1,
        datetime: new Date(2017, 7, 16, 17, 54, 1),
      },
      {
        id: '0x..',
        description: 'For access to Le Beach',
        amount_eth: 0,
        amount_pti: -1,
        datetime: new Date(2017, 7, 15, 20, 11, 1),
      },
      {
        id: '0x..',
        description: 'For 10MB of uploads',
        amount_eth: 0,
        amount_pti: 0.001,
        datetime: new Date(2017, 7, 15, 17, 55, 1),
      },
      {
        id: '0x..',
        description: 'For 10MB of uploads',
        amount_eth: 0,
        amount_pti: 0.001,
        datetime: new Date(2024, 9, 30, 16, 55, 1),
      },
      {
        id: '0x..',
        description: 'For 10MB of uploads',
        amount_eth: 0,
        amount_pti: 0.001,
        datetime: new Date(2024, 10, 1, 15, 55, 1),
      },
    ];
  },
});
