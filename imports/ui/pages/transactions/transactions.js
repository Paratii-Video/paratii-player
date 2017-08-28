import { getUserPTIAddress } from '/imports/api/users.js';
import { UserTransactions } from '/imports/api/transactions.js';
import './transactions.html';


const moment = require('moment');


Template.transactions.onCreated(function () {

  let template = Template.instance();

  template.searchQuery = new ReactiveVar();
  template.searching   = new ReactiveVar( false );

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
    let query = {};
    let template = Template.instance();
    let regex = new RegExp( template.searchQuery.get() , 'i' );

    query = {
      $or: [
        { _id: regex },
        { description: regex },
        { currency: regex },
        { from: regex },
        { to: regex },
      ]
    };
    return UserTransactions.find( query , { sort: { blockNumber: -1 } });
    // return Transactions.find({}, { sort: { blockNumber: -1 } });
    // return Session.get('transactions') || [];
  },
  userPTIAddress() {
    return getUserPTIAddress();
  },
});

Template.transactions.events({
  'keyup [name="search"]' ( event, template ) {
    let value = event.target.value.trim();

    if ( value !== '' && event.keyCode === 13 ) {
      template.searchQuery.set( value );
      template.searching.set( true );
    }

    if ( value === '' ) {
      template.searchQuery.set( value );
    }
  }
});
