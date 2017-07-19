import { getSeed } from '/imports/lib/ethereum/wallet.js';
import './showSeed.html';

Template.showSeed.helpers({
  seed() {
    const seed = Session.get('seed');
    return seed;
  },
  errorMessage() {
    const errorMessage = Session.get('errorMessage');
    return errorMessage;
  },
});

Template.showSeed.onDestroyed(function () {
  Session.set('seed', null);
  Session.set('errorMessage', null);
});

Template.showSeed.events({
  'submit #form-show-seed'(event) {
    event.preventDefault();
    const password = event.target.user_password.value;

    const button = $('#btn-show-seed');
    button.button('loading');
    getSeed(password, function () {
      button.button('reset');
    });
  },
});

export function showSeed() {
  Modal.show('showSeed', {});
}
