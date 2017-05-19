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
      }, {
        icon: '/img/myvideos_icon.svg',
        text: 'My Videos',
        path: FlowRouter.path('myvideos'),

      }, {
        icon: '/img/upload_icon.svg',
        text: 'Upload',
        path: FlowRouter.path('upload'),

      }, {
        icon: '/img/trendingcause_icon.svg',
        text: 'Trending causes',
        path: FlowRouter.path('trendingCauses'),

      }, {
        icon: '/img/wanderlust_icon.svg',
        text: 'Wanderlust',
        path: FlowRouter.path('wanderlust'),
      }, {
        icon: '/img/lock_icon.svg',
        text: 'DEBUG',
        path: FlowRouter.path('debug'),
      },
    ]);

    if (Meteor.userId()) {
      links = links.concat([
        {
          icon: '/img/avatar_img.svg',
          text: 'Log out',
          path: '',

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
});
