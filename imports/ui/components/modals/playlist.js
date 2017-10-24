import './playlist.html'

Template.modal_playlist.helpers({
  isAdd: (type) => type === 'add',
  isCreate: (type) => type === 'create',
  modalType: () => Template.instance().modalState.get('type')
})

Template.modal_playlist.onRendered(function () {
  Meteor.setTimeout(() => $('div.main-modal-playlist').addClass('show-content'), 1000)
})

Template.modal_playlist.onCreated(function () {
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})

Template.modal_playlist.events({
  'submit form.main-modal-form' (event) {
    event.preventDefault()
  }
})
