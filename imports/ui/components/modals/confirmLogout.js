import './confirmLogout.html'
import { hideModal } from '/imports/lib/utils.js'

Template.confirmLogout.events({
  'click #cancelBtn' (event) {
    hideModal()
  },
  'click #logoutBtn' (event) {
    Meteor.logout()
    hideModal()
  }
})
