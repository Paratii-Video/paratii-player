import { Template } from 'meteor/templating'
import './regenerateKeystore.html'

Template.regenerateKeystore.events({
  'click #restore-keystore' () {
    // Modal.hide('regenerateKeystore')
    console.log('open restorekystore')
    // TODO: make this work
    // Modal.show('restoreKeystore', {})
    Session.set('modalTemplate', 'restoreKeystore')
  },
  'click #create-wallet' () {
    console.log('TODO: merge the anonymous wallet to the new user')
    Session.set('modalTemplate', 'createNewWallet')
  }
})
