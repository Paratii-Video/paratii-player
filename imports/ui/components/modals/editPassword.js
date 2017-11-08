import { Template } from 'meteor/templating'
import { Accounts } from 'meteor/accounts-base'
import './editPassword.html'

Template.editPassword.onCreated(function () {
  this.errorMessage = new ReactiveVar('')
  this.currentPassword = new ReactiveVar('')
  this.newPassword = new ReactiveVar('')
})

Template.editPassword.helpers({
  disabled () {
    return (
      (
        !Template.instance().currentPassword.get() ||
        !Template.instance().newPassword.get()
      ) && 'disabled'
    ) || ''
  },
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.editPassword.events({
  'keyup #current-password, change #current-password' (event) {
    Template.instance().currentPassword.set(event.target.value)
  },
  'keyup #new-password, change #new-password' (event) {
    Template.instance().newPassword.set(event.target.value)
  },
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
