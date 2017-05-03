import './navigation.html';

Template.navigation.onCreated(function () {
  const appInstance = this.view.parentView.templateInstance();
  this.navState = appInstance.navState;
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
          icon: 'L',
          text: 'Your wallet',
          path: FlowRouter.path('wallet'),
        },
      ]);
    } else {
      links = links.concat([
        {
          icon: 'L',
          text: 'Login',
          path: FlowRouter.path('account'),
        },
      ]);
    }

    links = links.concat([
      {
        icon: 'P',
        text: 'Playlist',
        path: FlowRouter.path('playlists'),
      }, {
        icon: 'V',
        text: 'my videos [locked]',
      }, {
        icon: 'U',
        text: 'upload [locked]',
      }, {
        icon: 'T',
        text: 'trending causes [locked]',
      }, {
        icon: 'W',
        text: 'Wanderlust [locked]',
      }, {
        icon: 'P',
        text: 'About Paratii',
        path: FlowRouter.path('about'),
      }, {
        icon: 'X',
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
