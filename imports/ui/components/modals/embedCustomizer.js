import { Template } from 'meteor/templating'
import Clipboard from 'clipboard'
import './embedCustomizer.html'

let clipboard
Template.embedCustomizer.onCreated(function () {
  clipboard = new Clipboard('#copy_to_clipboard')
  clipboard.on('success', function (e) {
    setTooltip('Copied!')
    hideTooltip()
  })
  clipboard.on('error', function (e) {
    setTooltip('Failed!')
    hideTooltip()
  })

  $('#copy_to_clipboard').tooltip({
    trigger: 'click',
    placement: 'bottom'
  })
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

function setTooltip (message) {
  $('#copy_to_clipboard').tooltip('hide')
    .attr('data-original-title', message)
    .tooltip('show')
}

function hideTooltip () {
  setTimeout(function () {
    $('#copy_to_clipboard').tooltip('destroy')
  }, 1000)
}
