import { Template } from 'meteor/templating'
import './embedCustomizer.html'

Template.embedCustomizer.helpers({
  embedBaseUrl () {
    return Meteor.absoluteUrl.defaultOptions.rootUrl + 'embed/' + this.videoId
  },
  code () {
    var iframe = document.createElement('iframe')
    iframe.src = Meteor.absoluteUrl.defaultOptions.rootUrl + '/embed/' + this.videoId
    iframe.width = 570
    iframe.height = 320
    var iframeHtml = iframe.outerHTML
    console.log(iframeHtml)
    return iframeHtml
  }
})
Template.embedCustomizer.events({
  'click #clipboard' (event) {
  }
})
