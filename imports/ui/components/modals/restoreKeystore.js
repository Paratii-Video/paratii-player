import { Template } from 'meteor/templating'
import { restoreWallet } from '/imports/lib/ethereum/wallet.js'

import '/imports/api/users.js'
import './restoreKeystore.html'

Template.restoreKeystore.onCreated(function () {
  this.errors = new ReactiveDict()
  this.errors.set('password', null)
  this.errors.set('seed', null)
})

Template.restoreKeystore.helpers({
  getError (name) {
    return Template.instance().errors.get(name)
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
          } else {
            // Modal.hide('restoreKeystore')
            Modal.hide('userModal')
            Session.set('user-password', null)
            Session.set('modalTemplate', null)
          }
        })
      } else {
        instance.errors.set('password', 'Wrong password')
      }
    })
  }
})
