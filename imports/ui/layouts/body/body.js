import './body.html';

Template.App_body.onCreated(function () {
  // TODO: perhaps use a ReactiveDict here and store other state variables as well
  this.navState = new ReactiveVar('minimized');
});

Template.App_body.helpers({
  light() {
    return (Template.instance().navState.get() === 'maximized') ? '' : 'toggleFade';
  },
});

Template.App_body.events({
  'click .nav-overlay'(event, instance) {
    instance.navState.set('minimized');
  },
});
