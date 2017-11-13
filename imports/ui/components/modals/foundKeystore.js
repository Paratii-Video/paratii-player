import './foundKeystore.html'
import { showModal, hideModal, showGlobalAlert } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/alert/modalAlert.js'

Template.foundKeystore.events({
  'click #btn-foundKeystore-login' (event, instance) {
    showModal('login')
  },
  'click #btn-foundKeystore-cancel' (event, instance) {
    hideModal()
    showGlobalAlert(`You are now anonymous, of course you can <strong><a data-closealert data-showmodal="login">login</a></strong> at any moment`)
  }
})
