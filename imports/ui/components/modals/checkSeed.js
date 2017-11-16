/* eslint-env browser */
import { showModal, hideModal, showModalAlert } from '/imports/lib/utils.js'
import '/imports/ui/components/alert/modalAlert.html'
import '/imports/ui/components/form/mainFormInput.js'
import '/imports/ui/components/modals/showSeed.js'

import './checkSeed.html'

Template.checkSeed.onDestroyed(function () {
  Session.set('seed', null)
})

Template.checkSeed.events({
  'submit #form-check-seed' (event, instance) {
    event.preventDefault()
    const pastedSeed = event.target.check_seed.value
    const seed = Session.get('seed')
    if (pastedSeed === seed) {
      hideModal()
    } else {
      showModalAlert('Hey, the seed you have just pasted is not correct. Go back and copy it again!', 'error')
    }
  },
  'click #btn-check-seed-back' (event, instance) {
    showModal('showSeed')
  }
})
