import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/modals/restoreKeystore.js'
import '/imports/ui/components/modals/regenerateKeystore.js'
import '/imports/ui/components/modals/createNewWallet.js'
import '/imports/ui/components/modals/showSeed.js'
import './userModal.html'

Template.userModal.onCreated(function () {
  Session.set('modalTemplate', this.data.setTemplate)
})

Template.userModal.helpers({
  setTemplate: () => Session.get('modalTemplate')
})
