import { Template } from 'meteor/templating';
import '/imports/api/users.js';
import './restoreKeystore.html';

Template.editProfile.helpers({

});


Template.editProfile.events({
  'click button'(event) {
    event.preventDefault();
  },
});
