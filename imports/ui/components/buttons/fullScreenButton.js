import { Template } from 'meteor/templating'
import './fullScreenButton.html'

const fullscreen = () => (
  document.fullscreenElement ||
  document.mozFullScreenElement ||
  document.webkitFullscreenElement ||
  document.msFullscreenElement
)

const requestCancelFullscreen = (element) => {
  if (element.exitFullscreen) {
    element.exitFullscreen()
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen()
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen()
  }
}

const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  }
}

Template.fullScreenButton.events({
  'click #fullscreen-button' (event, instance) {
    if (fullscreen()) {
      requestCancelFullscreen(document)
    } else {
      requestFullscreen(instance.data.target || document.body)
    }
  }
})
