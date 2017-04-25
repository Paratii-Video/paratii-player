import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/pages/debug/debug.js';
import '../../ui/pages/create_account/create_account.js';
import '../../ui/pages/user_info/user_info.js';

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

FlowRouter.route('/create-account', {
  name: 'create_account',
  action() {
    BlazeLayout.render('App_body', { main: 'create_account' });
  },
});

FlowRouter.route('/user-info/:userId', {
  name: 'user_info',
  action() {
    BlazeLayout.render('App_body', { main: 'user_info' });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('App_body', { main: 'App_notFound' });
  },
};
