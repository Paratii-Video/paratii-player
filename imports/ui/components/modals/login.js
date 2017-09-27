import { Template } from 'meteor/templating'
import { createAnonymousKeystore } from '/imports/lib/ethereum/wallet.js'
import '/imports/api/users.js'
import './login.html'

Template.login.events({
  'click button.submit' (event) {
    console.log('login done')
    Modal.hide('login')
  }
})

Template.login.onDestroyed(function () {
  // If the user close the modal without doing login
  if (Accounts.userId() === null) {
    // Create anonymous keystore
    createAnonymousKeystore()
  }
})
