import { Template } from 'meteor/templating'
import Clipboard from 'clipboard'
import './embedCustomizer.html'

Template.embedCustomizer.onCreated(function () {
  new Clipboard('#copy_to_clipboard')
})
Template.embedCustomizer.helpers({
  embedBaseUrl () {
    return Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + 'embed/' + this.videoId
  },
  code () {
    var iframe = document.createElement('iframe')
    iframe.src = Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/embed/' + this.videoId
    iframe.width = 570
    iframe.height = 320
    var iframeHtml = iframe.outerHTML
    console.log(iframeHtml)
    return iframeHtml
  }
})
Template.embedCustomizer.events({
  'click #copy_to_clipboard' (event) {

  }
})
