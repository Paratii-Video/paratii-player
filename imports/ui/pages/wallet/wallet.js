import { createWallet } from '/imports/lib/ethereum/wallet.js';
import { userPrettyName, getUserPTIaddress, getPassword } from '/imports/api/users.js';
import { Events } from '/imports/api/events.js';
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
  balance() {
    return Session.get('balance');
  },
  events() {
    // Perform a reactive database query against minimongo
    return Events.find();
  },
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
  'submit #form-send-paratii'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form elements
    const transaction = {};
    const target = event.target;

    transaction.sender = getUserPTIaddress();
    transaction.receiver = target.wallet_friend_number.value;
    transaction.amount = target.wallet_pti_amount.value;
    transaction.description = 'send pti';

    // Events have
    // sender , receiver, description , transactionId and amount
    Meteor.call('events.sendPTI', transaction, function (error) {
      if (error) {
        // TODO notify error
        return;
      }
      // Clear form
      target.wallet_pti_amount.value = '';
      target.wallet_friend_number.value = '';
    });
    Meteor.call('events.balance', getUserPTIaddress(), function (error, result) {
      Session.set('balance', result);
    });
  },


  // 'click #restore-wallet'(event, instance) {
  // },
});

Template.transaction.helpers({
  sendCheck() {
    if (this.sender === getUserPTIaddress()) {
      return true;
    }
    return false;
  },
});


// Meteor.user is not available when the application start,
// autorun restart the function till user is defined
Tracker.autorun(() => {
  const user = Meteor.user();
  if (user !== undefined) {
    const userPTIaddress = getUserPTIaddress();
    Meteor.subscribe('userTransactions', userPTIaddress);
    Meteor.call('events.balance', userPTIaddress, function (error, result) {
      Session.set('balance', result);
    });
  }
});
