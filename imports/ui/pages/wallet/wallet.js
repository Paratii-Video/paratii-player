/* eslint-disable no-alert */

import { createWallet, restoreWallet } from '/imports/lib/ethereum/wallet.js';
import { userPrettyName, getPassword } from '/imports/api/users.js';
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
  'click #restore-wallet'() {
    const seedPhrase = prompt('Please enter your 12-word seed phrase', '');
    getPassword().then(function (password) {
      if (password) {
        wallet = restoreWallet(password, seedPhrase);
      }
    });
  },
});
