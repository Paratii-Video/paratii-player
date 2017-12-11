import { Template } from 'meteor/templating'
import { showModal } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/editProfileInfo.js'
import '/imports/ui/components/modals/editPassword.js'
import './editProfile.html'

Template.editProfile.onRendered(function () {
  const firstNode = $(Template.instance().firstNode)
  Meteor.setTimeout(() => {
    firstNode.addClass('show')
  }, 100)
})

Template.editProfile.events({
  'click .edit-profile-info' () {
    $(Template.instance().firstNode).removeClass('show')
    Meteor.setTimeout(() => {
      $('div.main-app').removeClass('editProfileMenuOpen')
      Session.set('editProfileMenuOpen', false)
      showModal('editProfileInfo', {
        wrapperClass: 'wide'
      })
    }, 250)
  },
  'click .edit-password' () {
    $(Template.instance().firstNode).removeClass('show')
    Meteor.setTimeout(() => {
      $('div.main-app').removeClass('editProfileMenuOpen')
      Session.set('editProfileMenuOpen', false)
      showModal('editPassword')
    }, 250)
  }
})
