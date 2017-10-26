import './regenerateKeystore.html'

// import { getKeystore } from '/imports/lib/ethereum/wallet.js'

import '/imports/ui/components/modals/restoreKeystore.js'

Template.regenerateKeystore.events({
  'click #restore-keystore' () {
    Modal.hide('regenerateKeystore')
    console.log('open retstorekystore')
    // TODO: make this work
    Modal.show('restoreKeystore', {})
  },
  'click #create-wallet' () {
    // TODO
    console.log('TODO: merge the anonymous wallet to the new user')
    Modal.close('regenerateKeystore')
  }
})
