import { Template } from 'meteor/templating'
import Clipboard from 'clipboard'
import './embedCustomizer.html'

//

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
var isModalOpened = false
const animIn = 10
const animOut = 300
var $modal

// Share modal

Template.modal_share_video.onCreated(function () {
  isModalOpened = false
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})

Template.modal_share_video.helpers({
  isLinks: (type) => type === 'links',
  isEmbed: (type) => type === 'embed',
  modalType: () => Template.instance().modalState.get('type')
})

// Links

Template.modal_share_links.onRendered(() => {
  $modal = $('div.main-modal-share')
  modalShowContent()
})

Template.modal_share_links.onCreated(function () {
  setClipboard('#copy_url')
})

Template.modal_share_links.helpers({
  embedBaseUrl () {
    return Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/play/' + this.videoId
  },
  facebook () {
    var baseurl = 'https://www.facebook.com/sharer/sharer.php?u='
    return baseurl + Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/play/' + this.videoId
  },
  twitter () {
    var baseurl = 'https://twitter.com/intent/tweet?text='
    return baseurl + Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/play/' + this.videoId
  },
  whatsapp () {
    var baseurl = 'whatsapp://send?text='
    return baseurl + Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/play/' + this.videoId
  },
  telegram () {
    var baseurl = 'https://t.me/share/url?url='
    return baseurl + Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/play/' + this.videoId
  },
  email () {
    var baseurl = 'mailto:?&subject=Paratii&body='
    return baseurl + Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '') + '/play/' + this.videoId
  }
})

Template.modal_share_links.events({
  'click button.gotoembed' (event, instance) {
    modalHideContent(instance.view.parentView.parentView, 'embed')
  }
})

// Embed

Template.modal_share_embed.onRendered(() => modalShowContent())

Template.modal_share_embed.onCreated(function () {
  this.iframe = new ReactiveDict()
  // default size
  this.iframe.set('size', embedSizes[0])
  this.iframe.set('allowfullscreen', false)
  this.iframe.set('autoplay', false)
  this.iframe.set('loop', false)
  this.iframe.set('playsinline', false)

  setClipboard('#copy_embed_code')
})

Template.modal_share_embed.helpers({
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

Template.modal_share_embed.events({
  'change .sizes' (event) {
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
  },
  'click button.gotolinks' (event, instance) {
    modalHideContent(instance.view.parentView.parentView, 'links')
  }
})

//

function modalShowContent () {
  let timeAnimIn = animIn

  if (!isModalOpened) {
    isModalOpened = true
    timeAnimIn = animIn + 850
  }

  Meteor.setTimeout(() => $modal.addClass('show-content'), timeAnimIn)
}

function modalHideContent (template, type) {
  $modal.removeClass('show-content')
  Meteor.setTimeout(() => template.templateInstance().modalState.set('type', type), animOut)
}

//

function setClipboard (element) {
  clipboard = new Clipboard(element)
  clipboard.on('success', function (e) {
    setTooltip('Copied!', element)
    hideTooltip(element)
  })

  clipboard.on('error', function (e) {
    setTooltip('Failed!', element)
    hideTooltip(element)
  })

  $(element).tooltip({
    trigger: 'click',
    placement: 'bottom'
  })
}

function setTooltip (message, element) {
  $(element).tooltip('hide')
    .attr('data-original-title', message)
    .tooltip('show')
}

function hideTooltip (element) {
  setTimeout(function () {
    $(element).tooltip('destroy')
  }, 1000)
}

//

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
