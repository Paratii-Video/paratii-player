import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '/imports/ui/layouts/body/body.js';
import '/imports/ui/pages/home/home.js';
import '/imports/ui/pages/not-found/not-found.js';
import '/imports/ui/pages/about/about.js';
import '/imports/ui/pages/account/account.js';
import '/imports/ui/pages/account/created.js';
import '/imports/ui/pages/account/signup.js';
import '/imports/ui/pages/account/info.js';
import '/imports/ui/pages/debug/debug.js';
import '/imports/ui/pages/playlists/playlists.js';
import '/imports/ui/pages/video/video.js';

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

FlowRouter.route('/account-signup', {
  name: 'account_signup',
  action() {
    BlazeLayout.render('App_body', { main: 'account_signup' });
  },
});

FlowRouter.route('/account-created', {
  name: 'account_created',
  action() {
    BlazeLayout.render('App_body', { main: 'account_created' });
  },
});
FlowRouter.route('/account-info', {
  name: 'account_info',
  action() {
    BlazeLayout.render('App_body', { main: 'account_info' });
  },
});


FlowRouter.route('/playlists', {
  name: 'playlists',
  action() {
    BlazeLayout.render('App_body', { main: 'playlists' });
  },
});

FlowRouter.route('/video', {
  name: 'video',
  action() {
    BlazeLayout.render('App_body', { main: 'video' });
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
