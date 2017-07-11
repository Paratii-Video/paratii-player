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
    const digest = Package.sha.SHA256(password);
    Meteor.call('checkPassword', digest, function (err, result) {
      if (result) {
        getSeed(password);
      }
    });
    return false;
  },
});

export function showSeed() {
  Modal.show('showSeed', {});
}
