import { Template } from 'meteor/templating'
import './editEmail.html'

Template.editEmail.onCreated(function () {
  this.errorMessage = new ReactiveVar('')
  this.errorMessage.set('')
})

Template.editEmail.helpers({
  userEmail () {
    const user = Meteor.user()
    return (user && user.emails && user.emails[0] && user.emails[0].address) || ''
  },
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.editEmail.events({
  'submit .edit-email-modal form' (event) {
    const templateInstance = Template.instance()

    // Prevent default browser form submit
    event.preventDefault()
    const target = event.target
    Meteor.call('users.update', {
      email: target['new-email'].value
    }, function (e) {
      if (e) {
        templateInstance.errorMessage.set(e.reason)
      } else {
        templateInstance.errorMessage.set('')
        Modal.hide(templateInstance)
      }
    })
  }
})
