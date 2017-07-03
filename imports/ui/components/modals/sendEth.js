import { Template } from 'meteor/templating';
import '/imports/api/users.js';
import './sendEth.html';

Template.sendEth.helpers({
  ima() {
    return Session.get('dataUrl');
  },
  userEmail() {
    return Meteor.user().emails[0].address;
  },
});


Template.sendEth.events({

});
