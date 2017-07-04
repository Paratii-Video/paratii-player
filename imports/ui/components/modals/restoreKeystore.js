import { Template } from 'meteor/templating';
import { restoreWallet } from '/imports/lib/ethereum/wallet.js';

import '/imports/api/users.js';
import './restoreKeystore.html';

Template.restoreKeystore.helpers({

});


Template.restoreKeystore.events({
  'submit #form-restore-keystore'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    restoreWallet(target['field-password'].value, target['field-seed'].value);
  },
});
