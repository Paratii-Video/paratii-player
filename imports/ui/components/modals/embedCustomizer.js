import { Template } from 'meteor/templating'
import Clipboard from 'clipboard'
import './embedCustomizer.html'

let clipboard
const embedSizes = [
  {
    type: 'mini',
    width: 570,
    height: 320

  },
  {
    type: 'tiny',
    width: 340,
    height: 190

  }

]

Template.embedCustomizer.onCreated(function () {
  this.iframe = new ReactiveDict()
  // default size
  this.iframe.set('size', embedSizes[0])
  this.iframe.set('allowfullscreen', false)
  this.iframe.set('autoplay', false)
  this.iframe.set('loop', false)
  this.iframe.set('playsinline', false)

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
  embedSizes,
  embedBaseUrl () {
    return Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + 'embed/' + this.videoId
  },
  code () {
    const iframe = document.createElement('iframe')
    let parameters = {}

    if (Template.instance().iframe.get('autoplay')) {
      parameters.autoplay = 1
    }
    if (Template.instance().iframe.get('loop')) {
      parameters.loop = 1
    }
    if (Template.instance().iframe.get('playsinline')) {
      parameters.playsinline = 1
    }

    if (Template.instance().iframe.get('allowfullscreen')) {
      iframe.setAttribute('webkitallowfullscreen', true)
      iframe.setAttribute('mozallowfullscreen', true)
      iframe.setAttribute('allowfullscreen', true)
      parameters.fullscreen = 1
    }
    parameters.type = Template.instance().iframe.get('size').type
    const src = buildUrl(Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/embed/' + this.videoId, parameters)
    iframe.src = 'srcplaceholder'

    iframe.width = Template.instance().iframe.get('size').width
    iframe.height = Template.instance().iframe.get('size').height
    iframe.setAttribute('frameborder', 0)
    var iframeHtml = '' + iframe.outerHTML
    console.log(iframeHtml)
    iframeHtml = iframeHtml.replace('srcplaceholder', src)
    console.log(typeof (iframeHtml))
    return iframeHtml
  },
  isChecked (index) {
    return index === 0
  }
})
Template.embedCustomizer.events({
  'change .sizes' (event) {
    console.log(event.target.value)
    const size = event.target.value
    Template.instance().iframe.set('size', embedSizes[size])
  },
  'change .fullscreen' (event) {
    Template.instance().iframe.set('allowfullscreen', event.target.checked)
  },
  'change .autoplay' (event) {
    Template.instance().iframe.set('autoplay', event.target.checked)
  },
  'change .loop' (event) {
    Template.instance().iframe.set('loop', event.target.checked)
  },
  'change .playsinline' (event) {
    Template.instance().iframe.set('playsinline', event.target.checked)
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

function buildUrl (url, parameters) {
  var qs = ''
  for (var key in parameters) {
    var value = parameters[key]
    qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&'
  }
  if (qs.length > 0) {
    qs = qs.substring(0, qs.length - 1) // chop off last "&"
    url = url + '?' + qs
  }
  return url
}
