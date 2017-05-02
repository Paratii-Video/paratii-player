import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '/imports/ui/layouts/body/body.js';
import '/imports/ui/pages/home/home.js';
import '/imports/ui/pages/not-found/not-found.js';
import '/imports/ui/pages/about/about.js';
import '/imports/ui/pages/account/account.js';
import '/imports/ui/pages/debug/debug.js';
import '/imports/ui/pages/playlists/playlists.js';
import '/imports/ui/pages/player/player.js';
import '/imports/ui/pages/wallet/wallet.js';


// Set up all routes in the app
FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'App_home' });
  },
});

FlowRouter.route('/debug', {
  name: 'debug',
  action() {
    BlazeLayout.render('App_body', { main: 'debug' });
  },
});

FlowRouter.route('/account', {
  name: 'account',
  action() {
    BlazeLayout.render('App_body', { main: 'account' });
  },
});


FlowRouter.route('/wallet', {
  name: 'wallet',
  action() {
    BlazeLayout.render('App_body', { main: 'wallet' });
  },
});

FlowRouter.route('/playlists', {
  name: 'playlists',
  action() {
    BlazeLayout.render('App_body', { main: 'playlists' });
  },
});

FlowRouter.route('/player', {
  name: 'player',
  action() {
    BlazeLayout.render('App_body', { main: 'player' });
  },
});

FlowRouter.route('/about', {
  name: 'about',
  action() {
    BlazeLayout.render('App_body', { main: 'about' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};

//Routes
// AccountsTemplates.configureRoute('changePwd');
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.configureRoute('resetPwd');
// AccountsTemplates.configureRoute('signIn');
// AccountsTemplates.configureRoute('signUp');
// AccountsTemplates.configureRoute('verifyEmail');