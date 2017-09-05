/* globals SVGInjector */
import 'meteor/johnantoni:meteor-svginjector'
import { web3 } from '/imports/lib/ethereum/connection.js'
import './navigation.html'

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
  navLinks () {
    let links = []

    links = links.concat([
      {
        icon: '/img/playlists_icon.svg',
        text: 'Playlist',
        path: FlowRouter.path('playlists'),
        id: 'playlist'
      }, {
        icon: '/img/myvideos_icon.svg',
        text: 'My Videos',
        path: FlowRouter.path('myvideos'),
        id: 'myvideos',
        locked: true
      }, {
        icon: '/img/upload_icon.svg',
        text: 'Upload',
        path: FlowRouter.path('upload'),
        id: 'upload',
        locked: true
      }, {
        icon: '/img/trendingcause_icon.svg',
        text: 'Trending causes',
        path: FlowRouter.path('trendingCauses'),
        id: 'trendingCauses',
        locked: true
      }, {
        icon: '/img/wanderlust_icon.svg',
        text: 'Wanderlust',
        path: FlowRouter.path('wanderlust'),
        id: 'wanderlust',
        locked: true
      }, {
        icon: '/img/lock_icon.svg',
        text: 'DEBUG',
        path: FlowRouter.path('debug'),
        id: 'debug'
      }
    ])

    if (Meteor.userId()) {
      links = links.concat([
        {
          icon: '/img/avatar_img.svg',
          text: 'Log out',
          path: '/',
          id: 'logout'
        }
      ])
    }
    return links
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
  'click #logout' () {
    Meteor.logout()
  }
})
