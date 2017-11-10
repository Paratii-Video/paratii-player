import { Template } from 'meteor/templating'
import { showModal, hideModal } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/editProfileInfo.js'
import '/imports/ui/components/modals/editPassword.js'
import './editProfile.html'

let modalToShow = null

Template.editProfile.onRendered(function () {
  this.$('.main-modal').on('hidden.bs.modal', function (e) {
    if (modalToShow) {
      showModal(...modalToShow)
    }
    modalToShow = null
  })
})

Template.editProfile.helpers({
  userEmail () {
    return Meteor.user().emails[0].address
  }
})

Template.editProfile.events({
  'click .edit-profile-info' () {
    hideModal()

    modalToShow = ['editProfileInfo', {
      wrapperClass: 'edit-profile-info-modal'
    }]
  },
  'click .edit-password' () {
    hideModal()

    modalToShow = ['editPassword']
  }
})
