import { getUserPTIAddress } from '/imports/api/users.js';
import { UserTransactions } from '/imports/api/transactions.js';
import './transactions.html';


const moment = require('moment');


Template.transactions.onCreated(function () {
  const userPTIAddress = getUserPTIAddress();
  // Meteor.subscribe('userTransactions', userPTIAddress);

  let template = Template.instance();

  template.searchQuery = new ReactiveVar();
  template.searching   = new ReactiveVar( false );

  template.autorun( () => {
    template.subscribe( 'userTransactions', userPTIAddress , template.searchQuery.get(), () => {
      setTimeout( () => {
        console.log("timeout");
        template.searching.set( false );
      }, 300 );
    });
  });


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
    return UserTransactions.find({}, { sort: { blockNumber: -1 } });
  // return Transactions.find({}, { sort: { blockNumber: -1 } });
  // return Session.get('transactions') || [];
  },
  userPTIAddress() {
    return getUserPTIAddress();
  },
  searching() {
    return Template.instance().searching.get();
  },
  query() {
   return Template.instance().searchQuery.get();
  },
});

Template.transactions.events({
  'keyup [name="search"]' ( event, template ) {
    let value = event.target.value.trim();
    console.log(value);
    if ( value !== '' && event.keyCode === 13 ) {
      template.searchQuery.set( value );
      template.searching.set( true );
    }

    if ( value === '' ) {
      template.searchQuery.set( value );
    }
  }
});
