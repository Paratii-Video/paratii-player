import { Template } from 'meteor/templating';
import '/imports/api/users.js';
import { sendEther } from '/imports/lib/ethereum/wallet.js';
import { web3 } from '/imports/lib/ethereum/connection.js';
import './sendEth.html';

Template.sendEth.helpers({
  ima() {
    return Session.get('dataUrl');
  },
  userEmail() {
    return Meteor.user().emails[0].address;
  },
});


Template.sendEth.events({
  'submit #form-send-ether'(event) {
    event.preventDefault();
    const amountInEth = event.target.wallet_pti_amount.value;
    const recipient = event.target.wallet_friend_number.value;
    const password = event.target.user_password.value;
    sendEther(amountInEth, recipient, password);
  },
});
