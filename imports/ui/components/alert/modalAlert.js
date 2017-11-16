import './modalAlert.html'
import { showModal, hideModalAlert } from '/imports/lib/utils.js'

Template.modalAlert.helpers({
  showClass () {
    return Session.get('modalAlertShow')
  },
  typeClass () {
    return Session.get('modalAlertClass')
  },
  message () {
    return Session.get('modalAlertMessage')
  }
})

Template.modalAlert.events({
  'click button.main-alert-button-close, click a[data-closealert]' (event, instance) {
    hideModalAlert()
  },
  'click a[data-showmodal]' (event, instance) {
    event.preventDefault()
    showModal($(event.target).data('showmodal'))
  }
})
