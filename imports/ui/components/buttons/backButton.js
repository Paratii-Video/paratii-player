import { FlowRouter } from 'meteor/kadira:flow-router'
import { setIsNavigatingBack, getPreviousPath, removeLastPreviousPath } from '/imports/lib/utils'
import './backButton.html'

const getPrevPage = () => (
  Template.instance().data.prevPage ||
  getPreviousPath()
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
      setIsNavigatingBack(true)
      FlowRouter.go(prevPage)

      if (prevPage === getPreviousPath()) {
        removeLastPreviousPath()
      }
    }
  }
})
