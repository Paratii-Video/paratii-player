import 'meteor/johnantoni:meteor-svginjector';
import './navigation.html';

const loadSVG = () => {
  const mySVGsToInject = document.querySelectorAll('.svg');
  return new SVGInjector(mySVGsToInject);
};

Template.navigation.onCreated(function () {
  const appInstance = this.view.parentView.templateInstance();
  this.navState = appInstance.navState;
});

Template.navigation.onRendered(function () {
  loadSVG();
});

Template.navigation.helpers({
  navState() {
    return Template.instance().navState.get();
  },
  navLinks() {
    let links = [];

    links = links.concat([
      {
        icon: '/img/playlists_icon.svg',
        text: 'Playlist',
        path: FlowRouter.path('playlists'),
        id: 'playlist',
      }, {
        icon: '/img/myvideos_icon.svg',
        text: 'My Videos',
        path: FlowRouter.path('myvideos'),
        id: 'myvideos',

      }, {
        icon: '/img/upload_icon.svg',
        text: 'Upload',
        path: FlowRouter.path('upload'),
        id: 'upload',

      }, {
        icon: '/img/trendingcause_icon.svg',
        text: 'Trending causes',
        path: FlowRouter.path('trendingCauses'),
        id: 'trendingCauses',

      }, {
        icon: '/img/wanderlust_icon.svg',
        text: 'Wanderlust',
        path: FlowRouter.path('wanderlust'),
        id: 'wanderlust',
      }, {
        icon: '/img/lock_icon.svg',
        text: 'DEBUG',
        path: FlowRouter.path('debug'),
        id: 'debug',
      },
    ]);

    if (Meteor.userId()) {
      links = links.concat([
        {
          icon: '/img/avatar_img.svg',
          text: 'Log out',
          path: 'account',
          id: 'logout',
        },
      ]);
    }
    return links;
  },
  aboutLink() {
    return {
      icon: '/img/logo_paratii.svg',
      text: 'About Paratii',
      path: FlowRouter.path('about'),
    };
  },
  isMaximized() {
    return (Template.instance().navState.get() === 'maximized');
  },
  ethNode() {
    return Session.get('ethNode');
  },
  ethAccount() {
    return Session.get('ethAccount');
  },
});

Template.navigation.events({
  'click #nav'(event, instance) {
    const navState = instance.navState.get();
    const targetName = event.target.tagName;
    let newState = 'maximized';
    if (navState === 'maximized' && targetName === 'DIV') {
      newState = 'minimized';
    }
    instance.navState.set(newState);
  },
  'mouseover #nav'(event, instance) {
    instance.navState.set('maximized');
  },
  'mouseout #nav'(event, instance) {
    instance.navState.set('minimized');
  },
  'click #logout'() {
    Meteor.logout();
  },
});
