import { Template } from 'meteor/templating'
import { mergeOrCreateNewWallet } from '/imports/lib/ethereum/wallet.js'
import { showModalAlert, hideModalAlert } from '/imports/lib/utils.js'
import '/imports/api/users.js'
import '/imports/ui/components/form/mainFormInput.js'
import './createNewWallet.html'

Template.createNewWallet.onCreated(function () {
  this.errorMessage = new ReactiveVar(null)
  hideModalAlert()
})

Template.createNewWallet.helpers({
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.createNewWallet.events({
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
        showModalAlert('Wrong password', 'error')
      }
    })
  }
})
