import './regenerateKeystore.html'
import { Template } from 'meteor/templating'
import { showModal } from '/imports/lib/utils.js'

Template.regenerateKeystore.events({
  'click #restore-keystore' () {
    console.log('open restorekystore')
    // TODO: make this work
    showModal('restoreKeystore', {backdrop: 'static'})
  },
  'click #create-wallet' () {
    console.log('TODO: merge the anonymous wallet to the new user')
    showModal('createNewWallet', {backdrop: 'static'})
  }
})
