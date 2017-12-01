/* eslint-env browser */
import { getSeedFromKeystore, getKeystore } from '/imports/lib/ethereum/wallet.js'
import { showModal, showModalAlert, hideModalAlert } from '/imports/lib/utils.js'
import '/imports/ui/components/alert/modalAlert.html'
import '/imports/ui/components/form/mainFormInput.js'
import '/imports/ui/components/modals/checkSeed.js'
import './showSeed.html'

Template.showSeed.onCreated(function () {
  // this.errorMessage = new ReactiveVar(null)
  hideModalAlert()
})

Template.showSeed.helpers({
  seed () {
    return Session.get('seed')
  }
  // errorMessage () {
  //   return Template.instance().errorMessage.get()
  // }
})

// Template.showSeed.onDestroyed(function () {
//   Session.set('seed', null)
// })

Template.showSeed.events({
  'click #btn-check-seed' (event, instance) {
    showModal('checkSeed', {blocking: true})
  },
  'submit #form-show-seed' (event, instance) {
    event.preventDefault()
    const password = event.target.user_password.value
    const keystore = getKeystore()
    const button = $('#btn-show-seed')
    button.button('loading')
    Meteor.call('checkPassword', password, (error, result) => {
      if (error) {
        showModalAlert(error, 'error')
        throw error
      }
      if (result) {
        hideModalAlert()
        getSeedFromKeystore(password, keystore, () => {
          button.button('reset')
        })
      } else {
        instance.errorMessage.set('Wrong password')
        showModalAlert(instance.errorMessage.get(), 'error')
        button.button('reset')
      }
    })
  }
})
