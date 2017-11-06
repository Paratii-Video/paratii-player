/* eslint-env browser */

import { Template } from 'meteor/templating'
import '/imports/api/users.js'
import '/imports/ui/components/modals/editPassword.js'
import '/imports/ui/components/modals/editUsername.js'
import './editProfile.html'

Modal.allowMultiple = true

Template.editProfile.helpers({
  ima () {
    return Session.get('dataUrl')
  },
  userEmail () {
    return Meteor.user().emails[0].address
  }
})

Template.editProfile.events({
  'click button' (event) {
    event.preventDefault()
  },
  'submit #form-update-profile' (event) {
    // Prevent default browser form submit
    event.preventDefault()
    const target = event.target
    Meteor.call('users.update', {
      // 'profile.fullname': target.fullname.value,
      email: target['field-email'].value,
      name: target['field-name'].value,
      avatar: Session.get('dataUrl')
    }, function () {
      Session.set('dataUrl', undefined)
      Modal.hide('editProfile')
    })
  },
  'click #button-remove-image, click #use-identicon' (event) {
    event.preventDefault()
    Session.set('dataUrl', null)
    Meteor.call('users.removeImage')
  },
  'change input[name="field-avatar-image"]' (event) {
    // Prevent default browser form submit
    const files = event.target.files
    if (files.length === 0) {
      return
    }
    const file = files[0]
    //
    //
    const fileReader = new FileReader()
    fileReader.onload = function (e) {
      const dataUrl = e.target.result
      Session.set('dataUrl', dataUrl)
    }
    fileReader.readAsDataURL(file)
  },
  'click .edit-password' () {
    Modal.hide('editProfile')

    Modal.show('editPassword', {})
  },
  'click .edit-username' () {
    Modal.hide('editProfile')

    Modal.show('editUsername')
  }
})
