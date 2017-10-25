import './body.html'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/modals/regenerateKeystore.js'
import { add0x } from '/imports/lib/utils.js'

import { keystoresCheck, createAnonymousKeystore, getKeystore } from '/imports/lib/ethereum/wallet.js'

if (Meteor.isClient) {
  // const keystoreAnonymous = getKeystore('anonymous')
  // console.log(add0x(keystoreAnonymous.getAddresses()[0]))
  Accounts.onLogin(function (user) {
    // User Logged In
    console.log('logged in!')
    const keystores = keystoresCheck()
    console.log(keystores)
    const keystore = getKeystore()
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
    if (keystore === null) {
      console.log('!!!! rigenera keystore')
      Modal.show('regenerateKeystore')
    } else {
      Session.set('userPTIAddress', add0x(keystore.getAddresses()[0]))
    }
  })

  Accounts.onLogout(function (user) {
    // User Logged Out
    console.log('logged out')
    // Reset all session values
    Session.set('userPTIAddress', null)
    Session.set('tempSeed', null)
    Session.set('tempKeystore', null)
    Session.set('tempAddress', null)
    Session.set('wallet-state', null)
  })
}

Template.App_body.onCreated(function () {
  // TODO: perhaps use a ReactiveDict here and store other state variables as well
  this.navState = new ReactiveVar('minimized')
  const keystores = keystoresCheck()
  console.log('####created')
  // If user is not logged in and is not in profile page
  if (Accounts.userId() === null && FlowRouter.getRouteName() !== 'profile') {
    console.log(keystores)
    if (keystores.users > 0) {
      // There is at least one User keystore
      // Propose to login if not create anonymous keystore
      Modal.show('login')
    } else {
      // If there is no User keystore
      console.log('no user keystore')
      Session.set('wallet-state', 'generating')
      // Create anonymouse keystore with 'password'
      createAnonymousKeystore()
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
