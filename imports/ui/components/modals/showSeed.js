import { getSeed, createKeystore } from '/imports/lib/ethereum/wallet.js';
import './showSeed.html';

Template.showSeed.onCreated(function () {
  this.errorMessage = new ReactiveVar(null);
});

Template.showSeed.helpers({
  seed() {
    const seed = Session.get('seed');
    return seed;
  },
  errorMessage() {
    return Template.instance().errorMessage.get();
  },
});

Template.showSeed.onDestroyed(function () {
  Session.set('seed', null);
});

const createNewSeed = (password) => {
  Session.set('wallet-state', 'generating');
  createKeystore(password, undefined, function (err, seed) {
    Session.set('wallet-state', '');
    button.button('reset');
    if(err) {
      throw err;
    }
    Session.set('seed', seed);
  });
};

Template.showSeed.events({
  'submit #form-show-seed'(event, instance) {
    event.preventDefault();
    const button = $('#btn-show-seed');
    button.button('loading');
    const password = event.target.user_password.value;
    Meteor.call('checkPassword', password, (error, result) => {
      if(result){
        if (this.type === 'create') {
          createNewSeed(password);
        } else {
          getSeed(password, () => {
            button.button('reset');
          });
        }
      } else {
        instance.errorMessage.set('Wrong password');
        button.button('reset');
      }
    });
  },
});

export function showSeed(type = 'show') {
  Modal.show('showSeed', { type });
}
