import { Template } from 'meteor/templating'
import { showModal, hideModal } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/editProfileInfo.js'
import '/imports/ui/components/modals/editPassword.js'
import './editProfile.html'

Modal.allowMultiple = true

Template.editProfile.helpers({
  userEmail () {
    return Meteor.user().emails[0].address
  }
})

Template.editProfile.events({
  'click .edit-profile-info' () {
    Modal.hide('editProfile')

    Modal.show('editProfileInfo')
  },
  'click .edit-password' () {
    hideModal('editProfile')

    showModal('editPassword')
  }
})
