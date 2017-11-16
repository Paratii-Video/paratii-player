/* eslint-env browser */
import { getSeedFromKeystore, getKeystore } from '/imports/lib/ethereum/wallet.js'
import { showModalAlert } from '/imports/lib/utils.js'
import './showSeed.html'
import '/imports/ui/components/alert/modalAlert.html'
import '/imports/ui/components/form/mainFormInput.js'

Template.showSeed.onCreated(function () {
  this.errorMessage = new ReactiveVar(null)
})

Template.showSeed.helpers({
  seed () {
    return Session.get('seed')
  },
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.showSeed.onDestroyed(function () {
  Session.set('seed', null)
})

Template.showSeed.events({
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
