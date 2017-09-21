import './body.html'

Template.App_body.onCreated(function () {
  // TODO: perhaps use a ReactiveDict here and store other state variables as well
  this.navState = new ReactiveVar('minimized')
})

Template.App_body.onRendered(function () {
  /*
    Minimize the menu when route change, is used to prevent
    UI bug if user play the video and go back with the browser back function
  */
  this.autorun(() => {
    FlowRouter.watchPathChange()
    // const currentContext = FlowRouter.current();
    this.navState.set('minimized')
  })
})

Template.App_body.helpers({
  light () {
    return (Template.instance().navState.get() === 'maximized') ? '' : 'toggleFade'
  },
  getRoute () {
    var current = FlowRouter.current()
    var route = current.route.name
    return route
  }
})

Template.App_body.events({
  'click .nav-overlay' (event, instance) {
    instance.navState.set('minimized')
  }
})
