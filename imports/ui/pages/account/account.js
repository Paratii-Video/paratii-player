import { Template } from 'meteor/templating';

import './account.html';

Template.account.helpers({
  ima() {
    return Session.get('dataUrl');
  },
  userEmail() {
    return Meteor.user().emails[0].address;
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
      avatar: Session.get('dataUrl'),
    }, function () {
      Session.set('dataUrl', undefined);
    });
  },
  'click #button-remove-image'(event) {
    event.preventDefault();
    Meteor.call('users.removeImage');
  },
  'change input[name="field-avatar-image"]'(event) {
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
