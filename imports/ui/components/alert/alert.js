import './alert.html'
import { showModal } from '/imports/lib/utils.js'

Template.alert.onRendered(() => {
  const fistNode = $(Template.instance().firstNode)
  Meteor.setTimeout(() => {
    fistNode.addClass('show')
  }, 100)
})

Template.alert.events({
  'click button.main-alert-button-close, click a[data-closealert]' (event, instance) {
    const type = instance.data.type

    $(Template.instance().firstNode).removeClass('show')

    Meteor.setTimeout(() => {
      if (type === 'modal') {
        Session.set('modalAlertMessage', null)
      } else {
        Session.set('globalAlertMessage', null)
      }
    }, 600)
  },
  'click a[data-showmodal]' (event, instance) {
    event.preventDefault()
    showModal($(event.target).data('showmodal'))
  }
})
