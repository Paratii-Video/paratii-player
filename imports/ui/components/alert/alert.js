import './alert.html'
import { showModal } from '/imports/lib/utils.js'

Template.alert.onRendered(() => {
  const fistNode = $(Template.instance().firstNode)
  Meteor.setTimeout(() => {
    fistNode.addClass('show')
  }, 100)
})

Template.alert.helpers({
  close () {
    let instance = Template.instance()
    let type = instance.data.type

    $(instance.firstNode).removeClass('show')

    Meteor.setTimeout(() => {
      if (type === 'modal') {
        Session.set('modalAlertMessage', null)
      } else {
        Session.set('globalAlertMessage', null)
      }
    }, 600)
  }
})

Template.alert.events({
  'click button.main-alert-button-close, click a[data-closealert]' (event, instance) {
    Template.alert.__helpers.get('close').call()
  },
  'click a[data-showmodal]' (event, instance) {
    event.preventDefault()
    showModal($(event.target).data('showmodal'))
  }
})
