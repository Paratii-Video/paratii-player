import { Template } from 'meteor/templating';
import { restoreWallet } from '/imports/lib/ethereum/wallet.js';

import '/imports/api/users.js';
import './restoreKeystore.html';

Template.restoreKeystore.onCreated(function () {
  this.error = new ReactiveVar();
});

Template.restoreKeystore.helpers({
  getError() {
    return Template.instance().error.get();
  },
});

Template.restoreKeystore.events({
  'submit #form-restore-keystore'(event, instance) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    restoreWallet(target['field-password'].value, target['field-seed'].value, function(err, seedPhrase){
      if (err) {
        instance.error.set('Invalid seed!');
      } else {
        Modal.hide('restoreKeystore');
      }
    });
  },
});
