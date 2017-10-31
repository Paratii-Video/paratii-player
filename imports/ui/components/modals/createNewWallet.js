import { Template } from 'meteor/templating'
import { createKeystore, deleteKeystore, getKeystore, getSeedFromKeystore } from '/imports/lib/ethereum/wallet.js'
import { hideModal } from '/imports/lib/utils.js'
import '/imports/api/users.js'
import './createNewWallet.html'

Template.createNewWallet.onCreated(function () {
  this.errorMessage = new ReactiveVar(null)
})

Template.createNewWallet.helpers({
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.createNewWallet.events({
  'submit #form-create-wallet' (event, instance) {
    // Prevent default browser form submit
    event.preventDefault()
    const password = event.target.user_password.value
    console.log('checking password')
    Meteor.call('checkPassword', password, (error, result) => {
      console.log('checked password')
      if (error) { throw error }
      console.log(result)
      if (result) {
        // TODO create a function
        // ----
        const anonymousKeystore = getKeystore('anonymous')
        if (anonymousKeystore !== null) {
          // we have an anonmous keystore - we need to regenarate a new keystore
          // with the same seed but the new password
          getSeedFromKeystore('password', anonymousKeystore, function (err, seedPhrase) {
            if (err) {
              throw err
            }
            createKeystore(password, seedPhrase, function (error, result) {
              if (error) {
                throw error
              }
              hideModal()
              deleteKeystore('anonymous')
              Session.set('user-password', null)
            })
          })
        } else {
          // TODO: do something here...
          console.log('no anonymous keystore found')
        }
        // ----
      } else {
        // TODO: password is not valid - inform the user
        instance.errorMessage.set('Wrong password')
      }
    })
  }
})
