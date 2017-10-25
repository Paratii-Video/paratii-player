import './body.html'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/modals/regenerateKeystore.js'
import { add0x } from '/imports/lib/utils.js'

import { keystoresCheck, createAnonymousKeystoreIfNotExists, createKeystore, deleteKeystore, getKeystore, getSeedFromKeystore } from '/imports/lib/ethereum/wallet.js'

if (Meteor.isClient) {
  // const keystoreAnonymous = getKeystore('anonymous')
  // console.log(add0x(keystoreAnonymous.getAddresses()[0]))
  Accounts.onLogin(function (user) {
    // User is logged in
    // const keystores = keystoresCheck()
    // get the user's keystore
    console.log('onLogin')
    const keystore = getKeystore()

    if (Session.get('signup')) {
      // user just signed up, we have to fix his keystore
      const anonymousKeystore = getKeystore('anonymous')
      if (anonymousKeystore !== null) {
        // we have an anonmous keystore - we need to regenarate a new keystore
        // with the same seed but the new password
        getSeedFromKeystore('password', anonymousKeystore, function (err, seedPhrase) {
          if (err) {
            throw err
          }
          Modal.show('showSeed', { type: 'show' })
          let password = Session.get('user-password')
          createKeystore(password, seedPhrase, function (error, result) {
            if (error) {
              throw error
            }
            deleteKeystore('anonymous')
          })
        })
      } else {
        console.log('non anonymous keystore found')
      }
    } else {
      if (keystore === null) {
        // the user has no keystore (yet)
        const anonymousKeystore = getKeystore('anonymous')
        console.log('ANON')
        console.log(anonymousKeystore)
        if (anonymousKeystore !== null) {

        } else {
          console.log('!!!! rigenera keystore')
          Modal.show('regenerateKeystore')
        }
      } else {
        Session.set('userPTIAddress', add0x(keystore.getAddresses()[0]))
      }
    }
    // Check if there is an anonymous keystore
    // if (keystores.anonymous > 0) {
    //   const keystoreAnonymous = getKeystore('anonymous')
    //   Session.set('anonymousAddress', add0x(keystoreAnonymous.getAddresses()[0]))
    //   console.log('keystore')
    //   console.log(keystore)
    //   console.log(add0x(keystore.getAddresses()[0]))
    //   console.log('keystore anonymous')
    //   console.log(add0x(keystoreAnonymous.getAddresses()[0]))
    // }
  })

  Accounts.onLogout(function (user) {
    // User Logged Out
    console.log('logged out')
    // Reset all session values
    Session.set('userPTIAddress', null)
    // Session.set('tempSeed', null)
    Session.set('tempKeystore', null)
    Session.set('tempAddress', null)
    Session.set('wallet-state', null)
  })
}

Template.App_body.onCreated(function () {
  // TODO: perhaps use a ReactiveDict here and store other state variables as well
  this.navState = new ReactiveVar('minimized')

  // TODO: the next lines (about anonymous keystore creation) should be run as early as possible: (perhaps App_body.onCreated is not the right place?)

  // if the user is not logged in, we create an anonymous keystore to use for transacting
  if (Accounts.userId() === null) {
    Session.set('wallet-state', 'generating')
      // Create anonymouse keystore with 'password'
    createAnonymousKeystoreIfNotExists()
  }
  // If user is not logged in and is not in profile page
  if (Accounts.userId() === null && FlowRouter.getRouteName() !== 'profile') {
    const keystores = keystoresCheck()
    if (keystores.users > 0) {
      // There is at least one User keystore
      // Propose to login if not create anonymous keystore
      Modal.show('login')
    } else {
      // If there is no User keystore
    }
  }
})

Template.App_body.onRendered(function () {
  /*
    Minimize the menu when route change, is used to prevent
    UI bug if user play the video and go back with the browser back function
  */
  this.autorun(() => {
    FlowRouter.watchPathChange()
    // verify if isn't a autoplay page
    if (parseInt(FlowRouter.getQueryParam('autoplay')) !== 1) {
      this.navState.set('minimized')
    }
  })
})

Template.App_body.helpers({
  light () {
    return (Template.instance().navState.get() === 'maximized') ? '' : 'toggleFade'
  },
  getRoute () {
    var current = FlowRouter.current()
    var route = current.route.name
    return route
  }
})

Template.App_body.events({
  'click .nav-overlay' (event, instance) {
    instance.navState.set('minimized')
  }
})
