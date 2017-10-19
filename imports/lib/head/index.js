function setHead () {
  Picker.route('/play/:_id', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)
    basicHead(params, req, res, next)
    twitterCardHead(params, req, res, next)

    next()
  })

  Picker.route('/oembed', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)
    console.log(params.query.url)
    var parser = parse_url(params.query.url)
    console.log(parser)

    res.setHeader('Content-Type', 'application/json')

    var oembedresponse = {}
    oembedresponse.version = '1.0'
    oembedresponse.type = 'rich'
    oembedresponse.provider_name = 'Paratii'
    oembedresponse.provider_url = Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '')
    oembedresponse.author_name = 'Creator name'
    oembedresponse.author_url = 'Creator url, maybe the channel?'
    // TODO: get ifram code
    oembedresponse.html = 'iframe code'
    oembedresponse.width = 700
    oembedresponse.height = 825
    oembedresponse.thumbnail_url = 'url for thumbnail'
    oembedresponse.thumbnail_width = 825
    oembedresponse.thumbnail_height = 825
    oembedresponse.referrer = ''
    oembedresponse.cache_age = 3600
    //     {
    //    "version": "1.0",
    //    "type": "rich",
    //
    //    "provider_name": "FWD:Everyone",
    //    "provider_url": "https://www.fwdeveryone.com"
    //
    //    "author_name": "Alex Krupp",
    //    "author_url": "https://www.fwdeveryone.com/u/alex3917",
    //
    //     "html": "<iframe src=\"https://oembed.fwdeveryone.com?thread-id=e8RFukWTS5Wo54fBNbZ2yQ\" width=\"700\" height=\"825\" scrolling=\"yes\" frameborder=\"0\" allowfullscreen></iframe>",
    //     "width": 700,
    //     "height": 825,
    //
    //     "thumbnail_url": "https://ddc2txxlo9fx3.cloudfront.net/static/fwd_media_preview.png",
    //     "thumbnail_width": 280,
    //     "thumbnail_height": 175,
    //
    //     "referrer": "",
    //     "cache_age": 3600,
    // }
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
function twitterCardHead (params, req, res, next) {
  var rootUrl = Meteor.absoluteUrl.defaultOptions.rootUrl.replace(/\/$/, '')
  req.dynamicHead = (req.dynamicHead || '')
  var videoID = params._id
  req.dynamicHead += '<meta property="twitter:card" content="player" />'
  req.dynamicHead += '<meta property="twitter:title" content="Custom player inside a twitter card" />'
  req.dynamicHead += '<meta property="twitter:site" content="https://gateway.ipfs.io/ipfs/QmcSHvFsGEU36viAkXo5PAkz1YgsorzT5LXR8uAnugJ7Hg">'
  req.dynamicHead += '<meta property="twitter:player:width" content="500" />'
  req.dynamicHead += '<meta property="twitter:player:height" content="500" />'
  req.dynamicHead += '<meta property="twitter:image" content="' + rootUrl + '/img/icon/apple-touch-icon.png" />'
  req.dynamicHead += '<meta property="twitter:player:stream" content="https://gateway.ipfs.io/ipfs/QmcSHvFsGEU36viAkXo5PAkz1YgsorzT5LXR8uAnugJ7Hg" />'
  req.dynamicHead += '<meta property="twitter:player" content="' + rootUrl + '/embed/' + videoID + '" />'
}

function basicHead (params, req, res, next) {
  req.dynamicHead = (req.dynamicHead || '')
  req.dynamicHead += '<title>Paratii Media Player</title>'

  req.dynamicHead += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">'
  req.dynamicHead += '<meta name="theme-color" content="#ffffff">'
  req.dynamicHead += '<link href="https://fonts.google.com/specimen/Roboto?selection.family=Roboto:300,500,700" rel="stylesheet">'
  req.dynamicHead += '<link rel="apple-touch-icon" sizes="180x180" href="/img/icon/apple-touch-icon.png">'
  req.dynamicHead += '<link rel="icon" type="image/png" sizes="32x32" href="/img/icon/favicon-32x32.png">'
  req.dynamicHead += '<link rel="icon" type="image/png" sizes="16x16" href="/img/icon/favicon-16x16.png">'
  req.dynamicHead += '<link rel="manifest" href="/img/icon/manifest.json">'
  req.dynamicHead += '<link rel="mask-icon" href="/img/icon/safari-pinned-tab.svg" color="#5bbad5">'
}

function parse_url (url) {
  var match = url.match(/^(http|https|ftp)?(?:[\:\/]*)([a-z0-9\.-]*)(?:\:([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i)
  var ret = new Object()

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
