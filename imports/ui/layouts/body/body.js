
import './body.html'
import '/imports/ui/components/svgs/svgs.js'
import { add0x, showModal, hideModal } from '/imports/lib/utils.js'
import { keystoresCheck, createAnonymousKeystoreIfNotExists, createKeystore, deleteKeystore, getKeystore, getSeedFromKeystore } from '/imports/lib/ethereum/wallet.js'
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
      // user just signed up, we have to fix his keystore
      const anonymousKeystore = getKeystore('anonymous')
      if (anonymousKeystore !== null) {
        // we have an anonmous keystore - we need to regenarate a new keystore
        // with the same seed but the new password
        getSeedFromKeystore('password', anonymousKeystore, function (err, seedPhrase) {
          if (err) {
            throw err
          }
          let password = Session.get('user-password')
          createKeystore(password, seedPhrase, Meteor.userId(), function (error, result) {
            if (error) {
              throw error
            }
            deleteKeystore('anonymous')
            showModal('showSeed')
            Session.get('user-password', null)
          })
        })
      } else {
        // TODO: do something here...
        console.log('no anonymous keystore found')
      }
    } else {
      if (keystore === null) {
        // this is an existing user (we are not in the singup process) , but the user has no keystore
        console.log('Getting anonymous keystore')
        const anonymousKeystore = getKeystore('anonymous')
        console.log(anonymousKeystore)
        if (anonymousKeystore !== null) {
          console.log('anonymousKeystore is not null, we have no keystore, this was an existing user,')
          showModal('regenerateKeystore')
        } else {
          // TODO: we don't have an anonymous keystore. This could be a timing problem (the keystore is still beging generated)
        }
      } else {
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

  Session.set({'alertMessage': undefined, 'alertClass': undefined})
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

  // Meteor.setTimeout(() => {
  //   Session.set({'alertMessage': '<strong>Error message</strong>. An error message', 'alertClass': 'red show'})
  // }, 1000)
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
    return Session.get('alertMessage')
  },
  setAlertClass () {
    return Session.get('alertClass')
  }
})

Template.App_body.events({
  'click .nav-overlay' (event, instance) {
    instance.navState.set('minimized')
  }
})
