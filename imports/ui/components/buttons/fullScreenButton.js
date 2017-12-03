import { Template } from 'meteor/templating'
import { toggleFullscreen } from '/imports/lib/utils'
import './fullScreenButton.html'

Template.fullScreenButton.events({
  'click #fullscreen-button' (event, instance) {
    toggleFullscreen(instance.data.target || document.body)
  }
})
