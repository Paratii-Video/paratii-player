import './foundKeystore.html'
import { showModal, hideModal, globalAlert } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/alert/alert.js'

Template.foundKeystore.events({
  'click #btn-foundKeystore-login' (event, instance) {
    showModal('login')
  },
  'click #btn-foundKeystore-cancel' (event, instance) {
    hideModal()
    globalAlert(`You are now anonymous, of course you can <strong><a data-closealert data-showmodal="login">login</a></strong> at any moment`)
  }
})
