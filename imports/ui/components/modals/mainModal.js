import './mainModal.html'
import '/imports/ui/components/alert/modalAlert.js'

Template.mainModal.onCreated(function () {
  Meteor.setTimeout(() => $('div.main-modal').addClass('show-content'), 850)
})

Template.mainModal.helpers({
  modalContentTemplate: () => Session.get('modalContentTemplate'),
  options: () => Session.get('modalOptions'),
  wrapperClass: () => Session.get('modalOptions') ? Session.get('modalOptions').wrapperClass : null,
  blocking: () => Session.get('modalOptions') ? Session.get('modalOptions').blocking : null
})
