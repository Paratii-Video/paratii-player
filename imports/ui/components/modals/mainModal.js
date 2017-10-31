import './mainModal.html'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/modals/restoreKeystore.js'
import '/imports/ui/components/modals/regenerateKeystore.js'
import '/imports/ui/components/modals/createNewWallet.js'
import '/imports/ui/components/modals/showSeed.js'

Template.mainModal.onCreated(function () {
  Session.set('modalTemplate', this.data.setTemplate)
})

Template.mainModal.helpers({
  setTemplate: () => Session.get('modalTemplate')
})
