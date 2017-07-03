import { Template } from 'meteor/templating';
import './sendPti.html';


Template.sendPti.events({

  'submit #form-send-paratii'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form elements
    const transaction = {};
    const target = event.target;

    transaction.sender = getUserPTIaddress();
    transaction.receiver = target.receiver_account.value;
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
      target.receiver_account.value = '';
    });
    Meteor.call('events.balance', getUserPTIaddress(), function (error, result) {
      Session.set('balance', result);
    });
  },

});
