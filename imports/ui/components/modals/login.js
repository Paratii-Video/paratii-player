import './login.html'
import './register.js'
import '/imports/api/users.js'
import { Template } from 'meteor/templating'
import { showModal, hideModal, showModalAlert, hideModalAlert } from '/imports/lib/utils.js'
import { createAnonymousKeystoreIfNotExists } from '/imports/lib/ethereum/wallet.js'

Template.login.onCreated(function () {
  this.errors = new ReactiveDict()
})

Template.login.onDestroyed(function () {
  console.log('Login template destroyed')
  // If the user close the modal without doing login
  if (Accounts.userId() === null) {
    // Create anonymous keystore
    // TODO: we create an anonymous keystore on App_body.onCreated - we probably do not need this here
    createAnonymousKeystoreIfNotExists()
  }
})

Template.login.helpers({
  getEmailError () {
    return Template.instance().errors.get('email')
  },
  getPasswordError () {
    return Template.instance().errors.get('password')
  }
})

Template.login.events({
  'submit #form-login' (event, instance) {
    event.preventDefault()
    const target = event.target
    const email = target['at-field-email'].value
    const password = target['at-field-password'].value
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        // console.log(err)
        instance.errors.set('email', 'Wrong email')
        instance.errors.set('password', 'Wrong password')
        // $email.addClass('error')
        // $password.addClass('error')
        showModalAlert('That email and password combination is incorrect.', 'error')
      } else {
        hideModal('login')
      }
    })
  },
  'click #at-signUp' () {
    hideModalAlert()
    showModal('register')
  }
})
