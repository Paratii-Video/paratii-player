import './modals.html'

Template.main_modal.onCreated(function () {
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})