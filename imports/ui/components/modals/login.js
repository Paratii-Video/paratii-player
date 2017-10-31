import './login.html'
import '/imports/api/users.js'
import { Template } from 'meteor/templating'
import { createAnonymousKeystoreIfNotExists } from '/imports/lib/ethereum/wallet.js'

Template.login.onDestroyed(function () {
  console.log('Login template destroyed')
  // If the user close the modal without doing login
  if (Accounts.userId() === null) {
    // Create anonymous keystore
    // TODO: we create an anonymous keystore on App_body.onCreated - we probably do not need this here
    createAnonymousKeystoreIfNotExists()
  }
})
