import { Template } from 'meteor/templating';

import './account.html';

Template.account.helpers({
  ima() {
    return Session.get('dataUrl');
  },
});


Template.account.events({
  'submit #form-update-account'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    const target = event.target;
    Meteor.call('users.update', {
      // 'profile.fullname': target.fullname.value,
      email: target['field-email'].value,
      name: target['field-name'].value,
    });
  },
  'change input[name="imageFile"]'(event) {
    // Prevent default browser form submit
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }
    const file = files[0];
    //
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const dataUrl = e.target.result;
      Session.set('dataUrl', dataUrl);
    };
    fileReader.readAsDataURL(file);
  },
});
