import { Template } from 'meteor/templating'
import { Accounts } from 'meteor/accounts-base'
import { hideModal, showModalAlert, hideModalAlert } from '/imports/lib/utils.js'
import { getSeed, restoreWallet } from '/imports/lib/ethereum/wallet.js'

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
    const password = target['current-password'].value
    const newPassword = target['new-password'].value

    Meteor.call('checkPassword', password, (error, result) => {
      if (error) { throw error }
      if (result) {
        getSeed(password, function (err, seedPhrase) {
          if (err) {
            // TODO we need to handlde this error
            templateInstance.errorMessage.set('Some errors on restore keystore')
            showModalAlert('Some errors on restore keystore', 'error')
          } else {
            // Create a wallet with old seed and new password
            restoreWallet(newPassword, seedPhrase, function (err, seedPhrase) {
              if (err) { throw err }
              templateInstance.errorMessage.set('')
              hideModalAlert()
              hideModal()
              // Change Meteor user password
              Accounts.changePassword(password, newPassword)
            })
          }
        })
      } else {
        // Password is not valid - inform the user
        showModalAlert('Wrong password', 'error')
      }
    })
  }
})
