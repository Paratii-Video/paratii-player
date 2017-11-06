import { Template } from 'meteor/templating'
import './editUsername.html'

Template.editUsername.onCreated(function () {
  this.errorMessage = new ReactiveVar('')
  this.errorMessage.set('')
})

Template.editUsername.helpers({
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.editUsername.events({
  'submit .edit-username-modal form' (event) {
    const templateInstance = Template.instance()

    // Prevent default browser form submit
    event.preventDefault()
    const target = event.target
    Meteor.call('users.update', {
      name: target['new-username'].value
    }, function (e) {
      if (e) {
        templateInstance.errorMessage.set('An unexpected error has occurred')
      } else {
        templateInstance.errorMessage.set('')
        Modal.hide(templateInstance)
      }
    })
  }
})
