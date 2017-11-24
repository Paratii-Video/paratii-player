import './register.html'
import './login.js'
import '/imports/api/users.js'
import { Accounts } from 'meteor/accounts-base'
import { Template } from 'meteor/templating'
import { showModal, showModalAlert, hideModalAlert } from '/imports/lib/utils.js'
import { createAnonymousKeystoreIfNotExists } from '/imports/lib/ethereum/wallet.js'

Template.register.onCreated(function () {
  this.errors = new ReactiveDict()
})

Template.register.onDestroyed(function () {
  // If the user close the modal without doing login
  if (Accounts.userId() === null) {
    // Create anonymous keystore
    // TODO: we create an anonymous keystore on App_body.onCreated - we probably do not need this here
    createAnonymousKeystoreIfNotExists()
  }
})

Template.register.helpers({
  getUserError () {
    return Template.instance().errors.get('user')
  },
  getEmailError () {
    return Template.instance().errors.get('email')
  },
  getPasswordError () {
    return Template.instance().errors.get('password')
  }
})

Template.register.events({
  'submit #form-register' (event, instance) {
    event.preventDefault()
    const target = event.target
    let user = {
      email: target['at-field-email'].value,
      password: target['at-field-password'].value,
      profile: {
        name: target['at-field-name'].value
      }
    }

    Session.set('user-password', user.password)

    Meteor.call('users.create', user, function (err, result) {
      if (err) {
        console.log(err.reason)
        showModalAlert(err.reason, 'error')
        if (err.reason === 'Need to set a username or email') {
          instance.errors.set('user', err.reason)
          instance.errors.set('email', err.reason)
          instance.errors.set('password', null)
        } else if (err.reason === 'Password may not be empty') {
          instance.errors.set('user', null)
          instance.errors.set('email', null)
          instance.errors.set('password', err.reason)
        } else if (err.reason === 'Email already exists') {
          instance.errors.set('user', null)
          instance.errors.set('email', err.reason)
          instance.errors.set('password', null)
        }
      } else {
        console.log(result)
        hideModalAlert()
        showModal('showSeed', {blocking: true})
      }
    })

    // Accounts.createUser(user, (err) => {
    //   if (err) {
    //     console.log(err.reason)
    //     showModalAlert(err.reason, 'error')
    //     if (err.reason === 'Need to set a username or email') {
    //       instance.errors.set('user', err.reason)
    //       instance.errors.set('email', err.reason)
    //       instance.errors.set('password', null)
    //     } else if (err.reason === 'Password may not be empty') {
    //       instance.errors.set('user', null)
    //       instance.errors.set('email', null)
    //       instance.errors.set('password', err.reason)
    //     } else if (err.reason === 'Email already exists') {
    //       instance.errors.set('user', null)
    //       instance.errors.set('email', err.reason)
    //       instance.errors.set('password', null)
    //     }
    //   } else {
    //     console.log('success!!!')
    //   }
    // })
  },
  'click #at-signUp' () {
    hideModalAlert()
    showModal('login')
  }
})
