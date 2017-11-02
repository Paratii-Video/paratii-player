/* eslint-env browser */
import { getSeedFromKeystore, getKeystore } from '/imports/lib/ethereum/wallet.js'
import { changePasswordType } from '/imports/lib/utils.js'
import './showSeed.html'

Template.showSeed.onCreated(function () {
  this.errorMessage = new ReactiveVar(null)
  Session.set('passwordType', 'password')
})

Template.showSeed.helpers({
  seed () {
    const seed = Session.get('seed')
    return seed
  },
  errorMessage () {
    return Template.instance().errorMessage.get()
  },
  passwordType () {
    const type = Session.get('passwordType')
    return type
  }
})

Template.showSeed.onDestroyed(function () {
  Session.set('seed', null)
  Session.set('passwordType', null)
})

Template.showSeed.events({
  'click button.password' () {
    changePasswordType()
  },
  'submit #form-show-seed' (event, instance) {
    event.preventDefault()
    const password = event.target.user_password.value
    const keystore = getKeystore()
    const button = $('#btn-show-seed')
    button.button('loading')
    Meteor.call('checkPassword', password, (error, result) => {
      if (error) {
        throw error
      }
      if (result) {
        getSeedFromKeystore(password, keystore, () => {
          button.button('reset')
        })
      } else {
        instance.errorMessage.set('Wrong password')
        button.button('reset')
      }
    })
  }
})
