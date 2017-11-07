import './alert.html'
import { showModal } from '/imports/lib/utils.js'

function closeAlert (type) {
  console.log(type)
  if (type === 'modal') {
    Session.set('modalAlertMessage', null)
  } else {
    Session.set('globalAlertMessage', null)
  }
}

Template.alert.onRendered(() => {
  const fistNode = $(Template.instance().firstNode)
  Meteor.setTimeout(() => {
    fistNode.addClass('show')
  }, 1)
})

Template.alert.events({
  'click button.main-alert-button-close, click a[data-closealert]' (event, instance) {
    let type = instance.data.type

    $(Template.instance().firstNode).removeClass('show')

    Meteor.setTimeout(() => {
      closeAlert(type)
    }, 600)
  },
  'click a[data-showmodal]' (event, instance) {
    showModal($(event.target).data('showmodal'))
  }
})
