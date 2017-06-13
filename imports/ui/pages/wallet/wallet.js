import { Accounts } from 'meteor/accounts-base';
import { createWallet } from '/imports/lib/ethereum/wallet.js';
import { userPrettyName, getUserPTIaddress, getPassword } from '/imports/api/users.js';
import { Events } from '../../../api/events.js';
import './wallet.html';

function showSeed(wallet) {
  // do not close when user clicks outside of the window
  const modalOptions = {
    backdrop: 'static',
    keyboard: false,
  };
  Modal.show('show-seed', {
    seed: wallet.seed,
    username: userPrettyName(),
  }, modalOptions);
}


Template.wallet.helpers({
  ethNode() {
    return Session.get('ethNode');
  },
  ethAccount() {
    return Session.get('ethAccount');
  },
  events: function () {
    // Perform a reactive database query against minimongo
    return Events.find();
  }
});

Template.wallet.events({
  'click #create-wallet'() {
    getPassword().then(function (password) {
      if (password) {
        wallet = createWallet(password);
        showSeed(wallet);
      }
    });
  },
  'submit #form-send-paratii': function(event){
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form elements
    let transaction = {};
    const target = event.target;

    transaction.sender = getUserPTIaddress();
    transaction.receiver = target.wallet_friend_number.value;
    transaction.amount = target.wallet_pti_amount.value;
    transaction.description = 'send pti';

    // Events have: sender , receiver (these are ethereum accounts), description , transactionId and amount, for now.
    Meteor.call("events.sendPTI", transaction);


    // Clear form
    target.wallet_pti_amount.value = '';
    target.wallet_friend_number.value = '';
  }


  // 'click #restore-wallet'(event, instance) {
  // },
});


// Meteor.user is not available when the application start,
// autorun restart the function till user is defined
Tracker.autorun(() => {
  let user = Meteor.user();
  if (user != undefined) {
    const userPTIaddress = getUserPTIaddress();
    console.log( getUserPTIaddress() );
    Meteor.subscribe('userTransactions', userPTIaddress, function(){ console.log("ready"); } );
  }
});
