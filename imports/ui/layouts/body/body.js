
import './body.html'
import '/imports/ui/components/svgs/svgs.js'
import { add0x, showModal, hideModal } from '/imports/lib/utils.js'
import { keystoresCheck, createAnonymousKeystoreIfNotExists, getKeystore, mergeOrCreateNewWallet } from '/imports/lib/ethereum/wallet.js'
import '/imports/ui/components/alert/alert.js'

// TODO: reconsider the location of the next code - perhaps move it to start.js ?
if (Meteor.isClient) {
  Accounts.onLogin(function (user) {
    // User is logged in
    console.log('onLogin')
    // if any modal is still open, we can safely close it now to make it possible to open new ones
    // get the user's keystore
    const keystore = getKeystore()
    if (Session.get('signup')) {
      Session.set('signup', false)
      const password = Session.get('user-password')
      // user just signed up, we have to fix his keystore
      mergeOrCreateNewWallet(password)
    } else {
      if (keystore === null) {
        // this is an existing user (we are not in the singup process) , but the user has no keystore
        // mergeOrCreateNewWallet passing empty password, a modal will ask user the passw
        console.log('Getting anonymous keystore')
        mergeOrCreateNewWallet()
      } else {
        // The normal login, the user has already a wallet on this browser
        Session.set('userPTIAddress', add0x(keystore.getAddresses()[0]))
        hideModal()
      }
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

  // TODO: the next lines (about anonymous keystore creation) should be run as early as possible: (perhaps App_body.onCreated is not the right place?)

  // if the user is not logged in, we create an anonymous keystore to use for transacting
  if (Accounts.userId() === null) {
    // Create anonymouse keystore with 'password'
    createAnonymousKeystoreIfNotExists()
  }
  // If user is not logged in and is not in profile page
  if (Accounts.userId() === null && FlowRouter.getRouteName() !== 'profile') {
    const keystores = keystoresCheck()
    if (keystores.users > 0) {
      // There is at least one User keystore
      // Propose to login if not create anonymous keystore
      showModal('login')
    } else {
      // If there is no User keystore
    }
  }

  Session.set({'globalErrorMessage': undefined, 'classAlertGlobal': undefined})
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

  // globalAlert('<strong>globalAlert</strong> and <strong>modalAlert</strong> You can <a href="/profile">go to a page</a> or <a href="/profile" data-showmodal="confirmLogout">open a modal</a> or <a href="/profile" data-showmodal="confirmLogout" data-closealert>open a modal and close the alert</a>', 'warning')
})

Template.App_body.helpers({
  light () {
    return (Template.instance().navState.get() === 'maximized') ? '' : 'toggleFade'
  },
  getRoute () {
    var current = FlowRouter.current()
    var route = current.route.name
    return route
  },
  setAlertMessage () {
    return Session.get('globalAlertMessage')
  },
  setAlertClass () {
    return Session.get('classAlertGlobal')
  },
  setAlertType () {
    return Session.get('globalAlertType')
  }
})

Template.App_body.events({
  'click .nav-overlay' (event, instance) {
    instance.navState.set('minimized')
  }
})
