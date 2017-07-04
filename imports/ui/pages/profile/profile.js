/* eslint-disable no-alert */

import { createWallet, restoreWallet, getKeystore } from '/imports/lib/ethereum/wallet.js';
import { getUserPTIaddress, getPassword } from '/imports/api/users.js';
import { Events } from '/imports/api/events.js';
import '/imports/ui/components/modals/editProfile.js';
import '/imports/ui/components/modals/sendEth.js';
import '/imports/ui/components/modals/sendPti.js';
import '/imports/ui/components/modals/restoreKeystore.js';
import '/imports/ui/components/modals/showSeed.js';
import './profile.html';


// function showSeed() {
//   // do not close when user clicks outside of the window
//   const password = prompt('GIVE ME YR PASSWORD:', 'password');
//   const seed = await getSeed(password);
//
//   const modalOptions = {
//     backdrop: 'static',
//     keyboard: false,
//   };
//   Modal.show('show-seed', {
//     seed,
//     username: userPrettyName(),
//   }, modalOptions);
// }


Template.profile.helpers({
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
  userEmail() {
    return Meteor.user().emails[0].address;
  },
  hasKeystore() {
    return (getKeystore() !== undefined) ? getKeystore() : false;
  },
  ptiAddress() {
    let keystore;
    let address;
    if (getKeystore() !== undefined) {
      keystore = getKeystore();
      address = keystore.ksData[keystore.defaultHdPathString].addresses[0];
      Modal.hide('restoreKeystore'); // Close restore modal if keystore is found in the localSTorage
    }
    return address;
  },
});


Template.profile.events({
  'click #create-wallet'() {
    getPassword().then(function (password) {
      if (password) {
        wallet = createWallet(password);
        // TODO: comment showSeed due error, to fix
        // showSeed(wallet);
      }
    });
  },
  'click #send-eth'() {
    Modal.show('sendEth', {});
  },
  'click #send-pti'() {
    Modal.show('sendPti', {});
  },
  'click #restore-keystore'() {
    Modal.show('restoreKeystore', {});
  },
  'click #restore-wallet'() {
    const seedPhrase = prompt('Please enter your 12-word seed phrase', '');
    getPassword().then(function (password) {
      if (password) {
        wallet = restoreWallet(password, seedPhrase);
      }
    });
  },
  'click #show-seed'() {
    // TODO: comment showSeed due error, to fix
    // showSeed();
  },
  'click #edit-profile'() {
    const modalOptions = {
    };
    Modal.show('editProfile', {
    }, modalOptions);
  },
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


Tracker.autorun(() => {
  const seed = Session.get('seed');
  if (seed != null) {
    const modalOptions = {
      seed,
    };
    Modal.show('showSeed', modalOptions);
    Session.set('seed', null);
  }
});
