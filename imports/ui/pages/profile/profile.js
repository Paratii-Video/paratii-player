/* eslint-disable no-alert */

import { createKeystore, getKeystore } from '/imports/lib/ethereum/wallet.js';
import { getUserPTIaddress, getPassword } from '/imports/api/users.js';
import { Events } from '/imports/api/events.js';
import '/imports/ui/components/modals/editProfile.js';
import '/imports/ui/components/modals/sendEth.js';
import '/imports/ui/components/modals/sendPti.js';
import '/imports/ui/components/modals/restoreKeystore.js';
import '/imports/ui/components/modals/showSeed.js';
import './profile.html';


Template.profile.helpers({
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
    const address = getUserPTIaddress();
    if (address !== undefined) {
      Modal.hide('restoreKeystore'); // Close restore modal if keystore is found in the localSTorage
    }
    return address;
  },
  eth_balance() {
    const balance = Session.get('eth_balance');
    if (balance !== undefined) {
      return web3.fromWei(balance, 'ether');
    }
    return '';
  },
  pti_balance() {
    const balance = Session.get('pti_balance');
    if (balance !== undefined) {
      // return web3.fromWei(balance, 'ether');
      return balance;
    }
    return '';
  },
});


Template.profile.events({
  'click #create-wallet'() {
    getPassword().then(function (password) {
      if (password) {
        wallet = createKeystore(password);
        Modal.show('showSeed', {});
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
  'click #show-seed'() {
    Modal.show('showSeed', {});
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
    // TODO: old implementation of events instead of BC
    // const userPTIaddress = getUserPTIaddress();
    // Meteor.subscribe('userTransactions', userPTIaddress);
  }
});


Tracker.autorun(() => {
  // const seed = Session.get('seed');
  // if (seed != null) {
  //   Modal.show('showSeed');
  // }
});
