import { Template } from 'meteor/templating'
import { restoreWallet } from '/imports/lib/ethereum/wallet.js'
import { hideModal, modalAlert } from '/imports/lib/utils.js'
import '/imports/api/users.js'
import '/imports/ui/components/form/mainFormInput.js'
import './restoreKeystore.html'

Template.restoreKeystore.onCreated(function () {
  this.errors = new ReactiveDict()
  this.errors.set('seed', null)
})

Template.restoreKeystore.helpers({
  getError (name) {
    return Template.instance().errors.get(name)
  },
  getSeedError () {
    return Template.instance().errors.get('seed')
  },
  getPasswordError () {
    return Template.instance().errors.get('password')
  }
})

Template.restoreKeystore.events({
  'submit #form-restore-keystore' (event, instance) {
    // Prevent default browser form submit
    event.preventDefault()
    const target = event.target
    const password = target['field-password'].value
    const seed = target['field-seed'].value
    Meteor.call('checkPassword', password, (error, result) => {
      if (error) { throw error }
      if (result) {
        restoreWallet(password, seed, function (err, seedPhrase) {
          if (err) {
            instance.errors.set('seed', 'Invalid seed!')
            modalAlert('Invalid seed', 'error')
          } else {
            hideModal()
            Session.set('user-password', null)
          }
        })
      } else {
        instance.errors.set('password', 'Wrong password')
        modalAlert('Wrong password', 'error')
      }
    })
  }
})
