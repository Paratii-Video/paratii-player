import 'meteor/johnantoni:meteor-svginjector';
import './navigation.html';

const loadSVG = () => {
  const mySVGsToInject = document.querySelectorAll('.svg');
  SVGInjector(mySVGsToInject);
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
    if (Meteor.userId()) {
      links = links.concat([
        {
          icon: '/img/avatar_img.svg',
          text: 'Your wallet',
          path: FlowRouter.path('wallet'),

        },
      ]);
    } else {
      links = links.concat([
        {
          icon: '',
          text: 'Login',
          path: FlowRouter.path('account'),
        },
      ]);
    }

    links = links.concat([
      {
        icon: '/img/playlists_icon.svg',
        text: 'Playlist',
        path: FlowRouter.path('playlists'),
      }, {
        icon: '/img/myvideos_icon.svg',
        text: 'My Videos',

      }, {
        icon: '/img/upload_icon.svg',
        text: 'Upload',

      }, {
        icon: '/img/trendingcause_icon.svg',
        text: 'Trending causes',

      }, {
        icon: '/img/wanderlust_icon.svg',
        text: '   Wanderlust',

      }, {
        icon: '/img/logo_paratii.svg',
        text: '   About Paratii',
        path: FlowRouter.path('about'),
      }, {
        icon: 'img/lock_icon.svg',
        text: 'DEBUG',
        path: FlowRouter.path('debug'),
      },
    ]);
    return links;
  },
  isMaximized() {
    return (Template.instance().navState.get() === 'maximized');
  },
});

Template.navigation.events({
  'click #nav'(event, instance) {
    const navState = instance.navState.get();
    let newState;
    if (navState !== 'maximized') {
      newState = 'maximized';
    } else {
      newState = 'minimized';
    }
    instance.navState.set(newState);
  },
});
