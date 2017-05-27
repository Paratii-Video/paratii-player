import { Template } from 'meteor/templating';

import './account.html';

Template.account.events({
  'submit #form-update-account'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    Meteor.call('users.update', {
      // 'profile.fullname': target.fullname.value,
      email: target.email.value,
    });
  },
});
