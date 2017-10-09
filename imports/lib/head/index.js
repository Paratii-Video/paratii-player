function setHead () {
  Picker.route('/', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)
    basicHead(params, req, res, next)

    next()
  })

  Picker.route('/play/:_id', (params, req, res, next) => {
    // console.log('calling home')
    // console.log(params)
    // console.log(req)
    basicHead(params, req, res, next)
    twitterCardHead(params, req, res, next)

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
export {setHead}
