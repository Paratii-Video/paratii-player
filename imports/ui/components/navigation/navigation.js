/* globals SVGInjector */
import './navigation.html'
import { showModal } from '/imports/lib/utils.js'
import { web3 } from '/imports/lib/ethereum/web3.js'
import paratiiIPFS from '/imports/lib/ipfs/index.js'
import 'meteor/johnantoni:meteor-svginjector'
import '/imports/ui/components/modals/login.js'
import '/imports/ui/components/modals/confirmLogout.js'
import '/imports/ui/components/modals/mainModal.js'

const loadSVG = () => {
  const mySVGsToInject = document.querySelectorAll('.svg')
  return new SVGInjector(mySVGsToInject)
}

Template.navigation.onCreated(function () {
  const appInstance = this.view.parentView.templateInstance()
  this.navState = appInstance.navState
})

Template.navigation.onRendered(function () {
  loadSVG()
})

Template.navigation.helpers({
  pti_balance () {
    const balance = Session.get('pti_balance')
    if (balance !== undefined) {
      return web3.fromWei(balance, 'ether')
    }
    return ''
  },
  navState () {
    return Template.instance().navState.get()
  },
  aboutLink () {
    return {
      icon: '/img/logo_paratii.svg',
      text: 'About Paratii',
      path: FlowRouter.path('about')
    }
  },
  isMaximized () {
    return (Template.instance().navState.get() === 'maximized')
  },
  userIsLoggedIn () {
    if (Meteor.userId()) { return true } else { return false }
  }
})

Template.navigation.events({
  'click #nav' (event, instance) {
    const navState = instance.navState.get()
    const targetName = event.target.tagName
    let newState = 'maximized'
    if (navState === 'maximized' && targetName === 'DIV') {
      newState = 'minimized'
    }
    instance.navState.set(newState)
  },
  'mouseover #nav' (event, instance) {
    instance.navState.set('maximized')
  },
  'mouseout #nav' (event, instance) {
    instance.navState.set('minimized')
  },
  'click #nav-profile' (event) {
    if (!Meteor.user()) {
      event.preventDefault()
      showModal('login')
    }
  },
  'click #logout' () {
    showModal('confirmLogout')
  },
  'click #clear-repo' (ev) {
    console.log('clearing cache . ', ev.target)
    ev.target.innerText = 'Clearing...'
    // paratii.ipfs.clearRepo()
    paratiiIPFS.clearRepo(() => {
      console.log('cache cleared')
      ev.target.innerText = 'Cache Cleared!!'
      setTimeout(() => {
        ev.target.innerText = 'Clear Cache'
      }, 5000)
    })
  }
})
