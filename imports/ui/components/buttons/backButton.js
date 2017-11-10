import './backButton.html'

Template.backButton.events({
  'click #back-button' () {
    window.history.back()
  }
})
