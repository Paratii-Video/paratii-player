import { Template } from 'meteor/templating'
import { showModal, hideModal } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/editProfileInfo.js'
import '/imports/ui/components/modals/editPassword.js'
import './editProfile.html'

Template.editProfile.helpers({
  userEmail () {
    return Meteor.user().emails[0].address
  }
})

Template.editProfile.events({
  'click .edit-profile-info' () {
    hideModal()

    setTimeout(() => {
      showModal('editProfileInfo', {
        wrapperClass: 'edit-profile-info-modal'
      })
    }, 500)
  },
  'click .edit-password' () {
    hideModal()

    setTimeout(() => {
      showModal('editPassword')
    }, 500)
  }
})
