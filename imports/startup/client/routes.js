import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Import needed templates
import '/imports/ui/pages/about/about.js'
import '/imports/ui/layouts/body/body.js'
import '/imports/ui/pages/debug/debug.js'
import '/imports/ui/pages/home/home.js'
import '/imports/ui/pages/playlists/playlists.js'
import '/imports/ui/pages/player/player.js'
import '/imports/ui/pages/profile/profile.js'
import '/imports/ui/pages/myvideos/myvideos.js'
import '/imports/ui/pages/not-found/not-found.js'
import '/imports/ui/pages/transactions/transactions.js'
import '/imports/ui/pages/upload/upload.js'
import '/imports/ui/pages/search/search.js'
import {Sniffer} from '/imports/lib/sniffing/index.js'

var sniffer = new Sniffer({debug: true, test: false})

sniffer.getClasses()          // 'Sony'
sniffer.mobile()          // 'Sony'
sniffer.isMobile()          // 'Sony'
sniffer.phone()          // 'Sony'
sniffer.isPhone()          // 'Sony'
sniffer.tablet()          // null
sniffer.isTablet()          // null
sniffer.userAgent()       // 'Safari'
sniffer.os()              // 'AndroidOS'
sniffer.is('iPhone')      // false
sniffer.is('bot')         // false
sniffer.version('Webkit')         // 534.3
sniffer.versionStr('Build')       // '4.1.A.0.562'
sniffer.match('playstation|xbox') // false

// define a new router group specific for public routing
var publicRoute = FlowRouter.group({
  name: 'public',
  triggersEnter: [
    setBodyClass
  ]
})

function setBodyClass () {
  document.body.className = ''
  document.body.className += sniffer.getClasses()
}

// Set up all routes in the app
publicRoute.route('/', {
  name: 'App.home',
  action () {
    BlazeLayout.render('App_body', { main: 'playlists' })
  }
})

publicRoute.route('/about', {
  name: 'about',
  action () {
    BlazeLayout.render('App_body', { main: 'about' })
  }
})

publicRoute.route('/myvideos', {
  name: 'myvideos',
  action () {
    BlazeLayout.render('App_body', { main: 'myvideos' })
  }
})

publicRoute.route('/playlists', {
  name: 'playlists',
  action () {
    BlazeLayout.render('App_body', { main: 'playlists' })
  }
})

publicRoute.route('/playlists/:_id', {
  name: 'playlists',
  action () {
    BlazeLayout.render('App_body', { main: 'playlists' })
  }
})

publicRoute.route('/profile', {
  name: 'profile',
  action () {
    if (Meteor.userId()) {
      BlazeLayout.render('App_body', { main: 'profile' })
    } else {
      FlowRouter.redirect('/')
    }
  }
})

publicRoute.route('/transactions', {
  name: 'transactions',
  action () {
    BlazeLayout.render('App_body', { main: 'transactions' })
  }
})

publicRoute.route('/upload', {
  name: 'upload',
  action () {
    BlazeLayout.render('App_body', { main: 'upload' })
  }
})

publicRoute.route('/search', {
  name: 'search',
  action () {
    BlazeLayout.render('App_body', { main: 'search' })
  }
})

publicRoute.route('/play/:_id', {
  name: 'player',
  action () {
    // previous/next buttons: need a reset to refresh the video tag
    // BlazeLayout.reset()
    BlazeLayout.render('App_body', { main: 'player' })
  }
})

publicRoute.route('/embed/:_id', {
  name: 'embed',
  action () {
    BlazeLayout.render('App_body', { main: 'player' })
  }
})

publicRoute.route('/debug', {
  name: 'debug',
  action () {
    BlazeLayout.render('App_body', { main: 'debug' })
  }
})

publicRoute.notFound = {
  action () {
    BlazeLayout.render('App_body', { main: 'App_notFound' })
  }
}
