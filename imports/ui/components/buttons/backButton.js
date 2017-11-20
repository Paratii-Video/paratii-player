import { FlowRouter } from 'meteor/kadira:flow-router'
import './backButton.html'

const getPrevPage = () => (
  Template.instance().data.prevPage ||
  Session.get('prevPage')
)

Template.backButton.helpers({
  shouldRender () {
    return !!getPrevPage()
  }
})

Template.backButton.events({
  'click #back-button' () {
    const prevPage = getPrevPage()
    if (prevPage) {
      FlowRouter.go(prevPage)
    }
  }
})
