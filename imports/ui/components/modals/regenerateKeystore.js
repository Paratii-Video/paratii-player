import './regenerateKeystore.html'
import '/imports/ui/components/modals/restoreKeystore.js'

Template.regenerateKeystore.events({
  'click #restore-keystore' () {
    Modal.hide('regenerateKeystore')
    console.log('open restorekystore')
    // TODO: make this work
    // Modal.show('restoreKeystore', {})
    Session.set('modalTemplate', 'restoreKeystore')
  },
  'click #create-wallet' () {
    // TODO
    console.log('TODO: merge the anonymous wallet to the new user')
    Modal.hide('modalTemplate')
  }
})
