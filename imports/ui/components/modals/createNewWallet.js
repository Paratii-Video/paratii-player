import { Template } from 'meteor/templating'
import { mergeOrCreateNewWallet } from '/imports/lib/ethereum/wallet.js'
import { changePasswordType } from '/imports/lib/utils.js'
import '/imports/api/users.js'
import './createNewWallet.html'

Template.createNewWallet.onCreated(function () {
  this.errorMessage = new ReactiveVar(null)

  Session.set('passwordType', 'password')
})

Template.doTransaction.onDestroyed(function () {
  Session.set('passwordType', null)
})

Template.createNewWallet.helpers({
  errorMessage () {
    return Template.instance().errorMessage.get()
  },
  passwordType () {
    return Session.get('passwordType')
  }
})

Template.createNewWallet.events({
  'click button.password' () {
    changePasswordType()
  },
  'submit #form-create-wallet' (event, instance) {
    // Prevent default browser form submit
    event.preventDefault()
    const password = event.target.user_password.value
    console.log('checking password')
    Meteor.call('checkPassword', password, (error, result) => {
      console.log('checked password')
      if (error) { throw error }
      console.log(result)
      if (result) {
        mergeOrCreateNewWallet(password)
      } else {
        // TODO: password is not valid - inform the user
        instance.errorMessage.set('Wrong password')
      }
    })
  }
})
