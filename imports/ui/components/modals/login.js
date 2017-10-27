import { Template } from 'meteor/templating'
import { createAnonymousKeystoreIfNotExists } from '/imports/lib/ethereum/wallet.js'
import '/imports/api/users.js'
import './login.html'

Template.login.events({
  'click button.submit' (event) {
    console.log('login done')
    // Modal.hide('login')
    Session.set('modalTemplate', 'regenerateKeystore')
  }
})

Template.login.onDestroyed(function () {
  console.log('distrutto')
  // Meteor.setTimeout(function () {
  //   console.log('Showing regenerateKeystore..')
  //   Modal.show('regenerateKeystore')
  // }, 2000)
  // If the user close the modal without doing login
  if (Accounts.userId() === null) {
    // Create anonymous keystore
    // TODO: we create an anonymous keystore on App_body.onCreated - we probably do not need this here
    createAnonymousKeystoreIfNotExists()
  }
})
