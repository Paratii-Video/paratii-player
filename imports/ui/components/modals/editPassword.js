import { Template } from 'meteor/templating'
import { Accounts } from 'meteor/accounts-base'
import './editPassword.html'

Template.editPassword.onCreated(function () {
  this.errorMessage = new ReactiveVar('')
  this.errorMessage.set('')
})

Template.editPassword.helpers({
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.editPassword.events({
  'submit .edit-password-modal form' (event) {
    const templateInstance = Template.instance()

    // Prevent default browser form submit
    event.preventDefault()
    const target = event.target
    Accounts.changePassword(
      target['current-password'].value,
      target['new-password'].value,
      function (e) {
        if (e) {
          templateInstance.errorMessage.set('Current password is incorrect')
        } else {
          templateInstance.errorMessage.set('')
          Modal.hide(templateInstance)
        }
      }
    )
  }
})
