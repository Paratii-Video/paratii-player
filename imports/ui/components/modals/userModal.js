import './userModal.html'

Template.userModal.onCreated(function () {
  Session.set('modalTemplate', this.data.setTemplate)
})

Template.userModal.helpers({
  setTemplate: () => Session.get('modalTemplate')
})
