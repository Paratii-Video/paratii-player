import './foundKeystore.html'
import { showModal, hideModal, showGlobalAlert } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/alert/modalAlert.js'

Template.foundKeystore.events({
  'click #btn-foundKeystore-login' (event, instance) {
    console.log('cliccato')
    showModal('login')
  },
  'click #btn-foundKeystore-cancel' (event, instance) {
    hideModal()
    showGlobalAlert(_(`You are now anonymous, of course you can <strong><a data-closealert data-showmodal="login">log in</a></strong> at any moment`))
    // This one is used to hide/show the foundKeystore modal
    window.sessionStorage.setItem('navigation', 'anonymous')
  }
})
