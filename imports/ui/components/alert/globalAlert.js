import './globalAlert.html'
import { showModal, hideGlobalAlert } from '/imports/lib/utils.js'

Template.globalAlert.helpers({
  showClass () {
    return Session.get('globalAlertShow')
  },
  typeClass () {
    return Session.get('globalAlertClass')
  },
  message () {
    return Session.get('globalAlertMessage')
  }
})

Template.globalAlert.events({
  'click button.main-alert-button-close, click a[data-closealert]' (event, instance) {
    hideGlobalAlert()
  },
  'click a[data-showmodal]' (event, instance) {
    event.preventDefault()
    showModal($(event.target).data('showmodal'))
  }
})
