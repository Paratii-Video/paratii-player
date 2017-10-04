function setHead () {
  Picker.route('/', (params, req, res, next) => {
    console.log('calling home')
    // console.log(params)
    // console.log(req)
    basicHead(req)

    next()
  })
}

function basicHead (req) {
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
