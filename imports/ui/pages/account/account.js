import { Template } from 'meteor/templating';
import { createWallet } from '../../../lib/ethereum/wallet.js';
import './account.html';

Template.account.events({
  // next lines are not working at this moment
  'submit #form-create-account'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    const password = target.password.value;
    const options = {
      username: target.username.value,
      email: target.email.value,
      password,
      // profile: {},
    };
    // create a new user (method returns user object)
    Meteor.call('users.create', options);
    // create a wallet (method returns seed)
    // todo: show the seed to the user
    createWallet(password, 'xxx');
  },
  'submit #form-update-account'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    Meteor.call('users.update', {
      'profile.fullname': target.fullname.value,
      email: target.email.value,
    });
  },
});
