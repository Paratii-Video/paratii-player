import { Template } from 'meteor/templating'
import Clipboard from 'clipboard'
import { removeTrailingSlash, showModalAlert } from '/imports/lib/utils.js'

import '/imports/ui/components/form/mainFormInput.js'
import './embedCustomizer.html'
import '/imports/ui/email/sharing.html'
import '/imports/ui/components/alert/modalAlert.js'

let clipboard
const embedSizes = [
  {
    type: 'mini',
    width: 490,
    height: 280

  },
  {
    type: 'tiny',
    width: 340,
    height: 190

  }
]

// Embed(wrapper)

Template.modal_share_video.onCreated(function () {
  this.modalState = new ReactiveDict()
  console.log(this)
  console.log(Template.instance())
  this.modalState.set('type', this.data.type)
})

Template.modal_share_video.helpers({
  isLinks: (type) => type === 'modal_share_links',
  isEmbed: (type) => type === 'modal_share_embed',
  isEmailSharing: (type) => type === 'modal_share_via_email',
  modalType: () => Template.instance().modalState.get('type')
})

// Links

Template.modal_share_links.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal').addClass('show-content'), timeIn)
})

Template.modal_share_links.onCreated(function () {
  setClipboard('#copy_url')
})

Template.modal_share_links.helpers({
  embedBaseUrl () {
    return removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/play/' + this.videoId
  },
  facebook () {
    var baseurl = 'https://www.facebook.com/sharer/sharer.php?u='
    return baseurl + removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/play/' + this.videoId
  },
  twitter () {
    var baseurl = 'https://twitter.com/intent/tweet'
    var url = '?url=' + removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/play/' + this.videoId
    var text = '&text=🎬 Worth a watch: ' + this.videoTitle
    return baseurl + url + text
  },
  whatsapp () {
    var baseurl = 'whatsapp://send?text='
    var url = removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/play/' + this.videoId
    var text = '🎬 Worth a watch: ' + this.videoTitle + ' '
    return baseurl + text + url
  },
  whatsappDesktop () {
    var baseurl = 'https://web.whatsapp.com/send?text='
    var url = removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/play/' + this.videoId
    var text = '🎬 Worth a watch: ' + this.videoTitle + ' '
    return baseurl + text + url
  },
  telegram () {
    var baseurl = 'https://t.me/share/url'
    var url = '?url=' + removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/play/' + this.videoId
    var text = '&text=🎬 Worth a watch: ' + this.videoTitle
    return baseurl + url + text
  }
})

Template.modal_share_links.events({
  'click button.gotoembed' (event, instance) {
    let templateView = instance.view.parentView.parentView

    $('div.main-modal').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_share_embed'), 300)
  },
  'click a.gotoemailsharing' (event, instance) {
    event.preventDefault()
    let templateView = instance.view.parentView.parentView
    $('div.main-modal').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_share_via_email'), 300)
  }
})

Template.modal_share_via_email.events({
  'submit #send_email' (event, instance) {
    event.preventDefault()
    const target = event.target
    const baseurl = removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl)
    const videoUrl = baseurl + '/play/' + this.videoId
    const videoTitle = this.videoTitle
    const videoDescription = this.videoDescription
    console.log(target['email'].value)
    var ipfsGateway = removeTrailingSlash(Meteor.settings.public.ipfs_gateway)
    var thumbUrl = this.videoThumb
    var thumbnailUrl = ipfsGateway + thumbUrl
    var dataContext = {
      video_url: videoUrl,
      video_title: videoTitle,
      video_thumb: thumbnailUrl,
      video_description: videoDescription,
      paratii_url: baseurl
    }
    var html = Blaze.toHTMLWithData(Template.email_template, dataContext)

    Meteor.call(
      'sendEmail',
      target['email'].value,
      'Paratii <sharing@player.paratii.video>',
      'You have to check this video I found (from Paratii with 💙)',
      html,
      function (err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log(result)
          if (result === 'sent') {
            let templateView = instance.view.parentView.parentView

            showModalAlert(_(`E-mail sent!`), 'success')

            $('div.main-modal').removeClass('show-content')
            Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_share_links'), 300)
          }
        }
      }
    )
  },
  'click button.gotolinks' (event, instance) {
    let templateView = instance.view.parentView.parentView

    $('div.main-modal').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_share_links'), 300)
  }
})

// Embed

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

Template.modal_share_embed.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal').addClass('show-content'), timeIn)
})

Template.modal_share_via_email.onRendered(() => {
  let timeIn = 10

  if (!$('div.main-modal').hasClass('opened')) {
    $('div.main-modal').addClass('opened')
    timeIn += 850
  }

  Meteor.setTimeout(() => $('div.main-modal').addClass('show-content'), timeIn)
})

Template.modal_share_embed.helpers({
  embedSizes,
  embedBaseUrl () {
    return removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + 'embed/' + this.videoId
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
    const src = buildUrl(removeTrailingSlash(Meteor.absoluteUrl.defaultOptions.rootUrl) + '/embed/' + this.videoId, parameters)
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
    let templateView = instance.view.parentView.parentView

    $('div.main-modal').removeClass('show-content')
    Meteor.setTimeout(() => templateView.templateInstance().modalState.set('type', 'modal_share_links'), 300)
  }
})

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
