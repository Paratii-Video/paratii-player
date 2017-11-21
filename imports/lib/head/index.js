import { Videos } from '/imports/api/videos.js'

function setHead () {
  Picker.route('/play/:_id', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)
    basicHead(params, req, res, next)
    twitterCardHeadPlayer(params, req, res, next)
    facebookOGHeadPlayer(params, req, res, next)

    next()
  })

  Picker.route('/oembed', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)

    var oembedresponse = {}
    if (params.query.url === undefined) {
      oembedresponse.error = 'urlMissing'
      res.end(JSON.stringify(oembedresponse))
    }

    var parsedExternalUrl = parseUrl(params.query.url)
    var parsedInternalUrl = parseUrl(Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, ''))
    console.log(parsedInternalUrl)
    console.log(parsedExternalUrl)
    res.setHeader('Content-Type', 'application/json')
    // check if the url passed in query parameter matches with our
    if (
      parsedExternalUrl.protocol === parsedInternalUrl.protocol &&
      parsedExternalUrl.host === parsedInternalUrl.host &&
      parsedExternalUrl.port === parsedInternalUrl.port
    ) {
      // url match

      // Get video id from the path
      var videoId = parsedExternalUrl.path.split('/')[2]
      var video = Videos.findOne({_id: videoId})
      console.log(video)
      // If video exist build response
      if (video) {
        var baseUrl = Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '')
        var ipfsGateway = Meteor.settings.public.ipfs_gateway.replace(/\/$/, '') + '/'
        var thumbUrl = video.thumb
        var videoTitle = video.title
        var videoDescription = video.description
        var creatorName = video.uploader.name
        oembedresponse.success = 'true'
        oembedresponse.version = '1.0'
        oembedresponse.type = 'rich'
        oembedresponse.title = videoTitle
        oembedresponse.description = videoDescription
        oembedresponse.provider_name = creatorName
        oembedresponse.provider_url = baseUrl
        oembedresponse.author_name = creatorName
        // TODO: creatore page it's not defined
        // oembedresponse.author_url = 'Creator url, maybe the channel?'
        // TODO: get iframe code of the mini version
        oembedresponse.html = '<iframe src="' + baseUrl + '/embed/' + videoId + '?type=mini" width="570" height="320" frameborder="0"></iframe>'
        oembedresponse.width = 570
        oembedresponse.height = 320
        oembedresponse.thumbnail_url = ipfsGateway + thumbUrl
        oembedresponse.thumbnail_width = 570
        oembedresponse.thumbnail_height = 320
        oembedresponse.referrer = ''
        oembedresponse.cache_age = 3600
      } else {
        // if not video exist i return a not found response
        oembedresponse.error = 'videoNotFound'
      }
    } else {
      // url don't match, denied
      oembedresponse.error = 'denied'
    }

    res.end(JSON.stringify(oembedresponse))
    next()
  })

  Picker.route('(.*)', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)
    basicHead(params, req, res, next)

    next()
  })
}

function twitterCardHeadPlayer (params, req, res, next) {
  var rootUrl = Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '')
  var ipfsGateway = Meteor.settings.public.ipfs_gateway.replace(/\/$/, '')
  req.dynamicHead = (req.dynamicHead || '')
  console.log('video Id : ', params._id)
  var videoId = params._id
  var video = Videos.findOne({_id: videoId})
  if (!video) {
    console.log('video is undefined ', video)
    return
  }
  console.log('video Record: ', video)
  var videoTitle = video.title
  var thumbUrl = video.thumb
  var ipfsSource = '/ipfs/' + video._id

  req.dynamicHead += '<meta property="twitter:card" content="player" />'
  req.dynamicHead += '<meta property="twitter:title" content="' + videoTitle + '" />'
  req.dynamicHead += '<meta property="twitter:site" content="' + rootUrl + '/play/' + videoId + '">'
  req.dynamicHead += '<meta property="twitter:player:width" content="570" />'
  req.dynamicHead += '<meta property="twitter:player:height" content="320" />'
  if (thumbUrl) {
    req.dynamicHead += '<meta property="twitter:image" content="' + ipfsGateway + thumbUrl + '" />'
  }
  req.dynamicHead += '<meta property="twitter:player:stream" content="' + ipfsGateway + ipfsSource + '" />'
  req.dynamicHead += '<meta property="twitter:player" content="' + rootUrl + '/embed/' + videoId + '?type=mini" />'
}

function facebookOGHeadPlayer (params, req, res, next) {
  var rootUrl = Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '')
  var ipfsGateway = Meteor.settings.public.ipfs_gateway.replace(/\/$/, '')
  req.dynamicHead = (req.dynamicHead || '')
  var videoId = params._id
  var video = Videos.findOne({_id: videoId})
  if (!video) {
    console.log('video is undefined ', video)
    return
  }
  console.log('video Record: ', video)
  var videoTitle = video.title
  var videoDescription = video.description
  var thumbUrl = video.thumb
  var ipfsSource = '/ipfs/' + video._id

  req.dynamicHead += '<meta property="og:video:url" content="' + ipfsGateway + ipfsSource + '" />'
  req.dynamicHead += '<meta property="og:video:secure_url" content="' + ipfsGateway + ipfsSource + '" />'
  req.dynamicHead += '<meta property="og:video:type" content="video/mp4">'
  req.dynamicHead += '<meta property="og:video:width" content="1920" />'
  req.dynamicHead += '<meta property="og:video:height" content="1080" />'
  req.dynamicHead += '<meta property="og:type" content="video.other" />'
  req.dynamicHead += '<meta property="og:url" content="' + rootUrl + '/play/' + videoId + '" />'
  req.dynamicHead += '<meta property="og:title" content="' + videoTitle + 'y" />'
  if (thumbUrl) {
    req.dynamicHead += '<meta property="og:image" content="' + ipfsGateway + thumbUrl + '" />'
  }

  if (videoDescription) {
    req.dynamicHead += '<meta property="og:description" content="' + videoDescription + '" />'
  }
}

function basicHead (params, req, res, next) {
  req.dynamicHead = (req.dynamicHead || '')
  req.dynamicHead += '<title>Paratii Media Player</title>'
  req.dynamicHead += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">'
  req.dynamicHead += '<meta name="theme-color" content="#ffffff">'
  req.dynamicHead += '<link href="https://fonts.googleapis.com/css?family=Roboto:300,500,700" rel="stylesheet">'
  req.dynamicHead += '<link rel="apple-touch-icon" sizes="180x180" href="/img/icon/apple-touch-icon.png">'
  req.dynamicHead += '<link rel="icon" type="image/png" sizes="32x32" href="/img/icon/favicon-32x32.png">'
  req.dynamicHead += '<link rel="icon" type="image/png" sizes="16x16" href="/img/icon/favicon-16x16.png">'
  req.dynamicHead += '<link rel="manifest" href="/img/icon/manifest.json">'
  req.dynamicHead += '<link rel="mask-icon" href="/img/icon/safari-pinned-tab.svg" color="#5bbad5">'
}

function parseUrl (url) {
  var match = url.match(/^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i)
  var ret = {}

  ret['protocol'] = ''
  ret['host'] = match[2]
  ret['port'] = ''
  ret['path'] = ''
  ret['query'] = ''
  ret['fragment'] = ''

  if (match[1]) {
    ret['protocol'] = match[1]
  }

  if (match[3]) {
    ret['port'] = match[3]
  }

  if (match[4]) {
    ret['path'] = match[4]
  }

  if (match[5]) {
    ret['query'] = match[5]
  }

  if (match[6]) {
    ret['fragment'] = match[6]
  }

  return ret
}
export {setHead}
