import { getSeed } from '/imports/lib/ethereum/wallet.js';
import './showSeed.html';

Template.showSeed.helpers({
  seed() {
    const seed = Session.get('seed');
    return seed;
  },
});

Template.showSeed.onDestroyed(function () {
  Session.set('seed', null);
});

Template.showSeed.events({
  'submit #form-show-seed'(event) {
    event.preventDefault();
    const password = event.target.user_password.value;
    getSeed(password);
  },
});

export function showSeed() {
  Modal.show('showSeed', {});
}
