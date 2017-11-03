import './alert.html'

Template.alert.events({
  'click button.main-alert-button-close' (event, instance) {
    $(instance.firstNode).removeClass('show')
  }
})
