import './alert.html'

Template.alert.onCreated(() => {
})

Template.alert.events({
  'click button.main-alert-button-close' (event, instance) {
    Session.set('classAlertModal', null)
    Meteor.setTimeout(() => {
      Session.set('modalErrorMessage', null)
      Session.set('globalErrorMessage', null)
    }, 600)
  },
  'show' () {
    console.log('you fired a alert show event')
  },
  'hide' () {
    console.log('you fired a alert hide event')
  }
})

Template.alert.helpers({
  'class' () {
    return Session.get('classAlertModal')
  }
})
