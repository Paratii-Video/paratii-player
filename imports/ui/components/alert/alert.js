import './alert.html'

Template.alert.onCreated(() => {
})

Template.alert.events({
  'click button.main-alert-button-close' (event, instance) {
    $(instance.find('.main-alert')).removeClass('show')
  },
  'show' () {
    console.log('you fired a alert show event')
  },
  'hide' () {
    console.log('you fired a alert hide event')
  }
})
