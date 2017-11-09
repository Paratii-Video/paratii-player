import './foundKeystore.html'
import { showModal, hideModal } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/login.js'

Template.foundKeystore.events({
  'click #btn-foundKeystore-login' (event, instance) {
    showModal('login')
  },
  'click #btn-foundKeystore-cancel' (event, instance) {
    hideModal()
  }
})
