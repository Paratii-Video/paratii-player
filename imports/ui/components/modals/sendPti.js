import { Template } from 'meteor/templating';
import '/imports/api/users.js';
import { sendParatii } from '/imports/lib/ethereum/wallet.js';
import './sendPti.html';

Template.sendPti.helpers({
  ima() {
    return Session.get('dataUrl');
  },
  userEmail() {
    return Meteor.user().emails[0].address;
  },
});


Template.sendPti.events({
  'submit #form-send-paratii'(event) {
    event.preventDefault();
    const amountInPti = event.target.wallet_pti_amount.value;
    const recipient = event.target.wallet_friend_number.value;
    const password = event.target.user_password.value;
    sendParatii(amountInPti, recipient, password);
  },
});
