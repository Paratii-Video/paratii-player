import { Template } from 'meteor/templating'
import { createKeystore, deleteKeystore, getKeystore, getSeedFromKeystore } from '/imports/lib/ethereum/wallet.js'
import '/imports/api/users.js'
import './createNewWallet.html'

Template.createNewWallet.events({
  'submit #form-create-wallet' (event, instance) {
    // Prevent default browser form submit
    event.preventDefault()
    const password = event.target.user_password.value
    Meteor.call('checkPassword', password, (error, result) => {
      if (error) { throw error }
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
            // Session.set('modalTemplate', 'showSeed')
            // Modal.show('userModal', { setTemplate: 'showSeed' })
            // const password = Session.get('user-password')
            // let password = 'password'
            createKeystore(password, seedPhrase, function (error, result) {
              if (error) {
                throw error
              }
              deleteKeystore('anonymous')
              Modal.hide('userModal')
              Session.set('user-password', null)
              Session.set('modalTemplate', null)
              // Modal.show('userModal', { setTemplate: 'showSeed' })
            })
          })
        } else {
          // TODO: do something here...
          console.log('no anonymous keystore found')
        }
        // ----
      }
    })
  }
})
