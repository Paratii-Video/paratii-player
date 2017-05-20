import { Template } from 'meteor/templating';
// import { web3 } from '/imports/lib/ethereum/web3.js';
// import lightwallet from "eth-lightwallet/dist/lightwallet.js";
// import HookedWeb3Provider from 'hooked-web3-provider';
import users from '../../../api/users.js';
// import { FlowRouter } from 'meteor/kadira:flow-router';
import { createWallet } from '../../../lib/ethereum/wallet.js';
import './account.html';

Template.account.events({
  // next lines are not working at this moment
  'submit #form-create-account'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    let password = target.password.value;
    let options = {
      username: target.username.value,
      email: target.email.value,
      password: password,
      profile: {},
    }
    // create a new user
    const user = users.createUser(options)
    // create a wallet
    const seed = createWallet(password, 'xxx');
    console.log('seed is important:' + seed);
    console.log(user)
    return
  },
  'submit #form-update-account'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    Meteor.call('users.update', Meteor.userId(), {
        'profile.fullname' : target.fullname.value,
        email: target.email.value,
    });
  },
});
