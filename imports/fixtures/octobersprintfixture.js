function videoInfo (opts) {
  let defaults = {
    _id: '1',
    // title: 'How the blockchain will radically transform the economy',
    // description: 'Bettina Warburg. Ted Talks<br>Source: https://www.ted.com/talks/bettina_warburg_how_the_blockchain_will_radically_transform_the_economy',
    thumb: '/img/cover/thumb1-img.png',
    duration: '',
    price: 0,
    uploader: {
      address: '',
      name: '',
      avatar: ''
    },
    stats: {
      likes_percentage: 84,
      views: 15524,
      likes: 2345555,
      dislikes: 7
    },
    tags: ['NATURE'],
    src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
    mimetype: 'video/webm'
  }
  return Object.assign(defaults, opts)
}

export const playlists = [
  {
    _id: '1',
    title: 'Intro to the blockchain',
    description: '',
    url: 'intro-to-the-blockchain',
    videos: ['1', 2, 3, 4, 5, 6, 7]
  }
]

let videosDef = [
// Playlist: Into to the blockchain
  {
    _id: '1',
    title: 'How the blockchain will radically transform the economy',
    description: 'Bettina Warburg. Ted Talks<br>Source: https://www.ted.com/talks/bettina_warburg_how_the_blockchain_will_radically_transform_the_economy'
  },
  {
    _id: '2',
    title: 'We\'ve stopped trusting institutions and started trusting strangers',
    description: 'Ted Talks.<br>Source:  https://www.ted.com/talks/rachel_botsman_we_ve_stopped_trusting_institutions_and_started_trusting_strangers'
  },
  {
    _id: '3',
    title: 'Could your language affect your ability to save money?',
    description: ' Ted Talks  https://www.ted.com/talks/keith_chen_could_your_language_affect_your_ability_to_save_money'
  },
  {
    _id: '4',
    title: 'Poverty isn\'t a lack of character; it\'s a lack of cash',
    description: 'Poverty isn\'t a lack of character; it\'s a lack of cash  Ted Talks  https://www.ted.com/talks/rutger_bregman_poverty_isn_t_a_lack_of_character_it_s_a_lack_of_cash'
  },
  {
    _id: '5',
    title: 'How the blockchain is changing money and business',
    description: 'How the blockchain is changing money and business  Ted Talks  https://www.ted.com/talks/don_tapscott_how_the_blockchain_is_changing_money_and_business'
  },
  {
    _id: '6',
    title: 'How we\'ll earn money in a future without jobs',
    description: 'How we\'ll earn money in a future without jobs  Ted Talks  https://www.ted.com/talks/martin_ford_how_we_ll_earn_money_in_a_future_without_jobs'
  },
  {
    _id: '7',
    title: 'The mathematician who cracked Wall Street',
    description: 'The mathematician who cracked Wall Street | Jim Simons  Ted Talks  https://www.youtube.com/watch?v=U5kIdtMJGc8'
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  },
  {
    _id: '',
    title: '',
    description: ''
  }
//
// Playlist: Cryptoeconomy & Events
// CESC2017 - Balaji Srinivasan - Quantifying Decentralization  Blockchain at Berkeley  https://www.youtube.com/watch?v=2GwN3vc_9ic
// CESC2017 - Shin’ichiro Matsuo - Global Scale Research Networks and Cryptoeconomics  Blockchain at Berkeley  https://www.youtube.com/watch?v=G9Bp56y3X8U
// CESC2017 - Vlad Zamfir - Cryptoeconomics in Casper  Blockchain at Berkeley  https://www.youtube.com/watch?v=5ScY7ruD_eg
// CESC2017 - Eleftherios Kokoris-Kogias - Scalable and Efficient Distributed Ledgers  Blockchain at Berkeley  https://www.youtube.com/watch?v=yZCe_ra2a8w
// CESC2017 - Karl Floersch - Casper Proof of Stake  Blockchain at Berkeley  https://www.youtube.com/watch?v=ycF0WFHY5kc
// CESC2017 - Neil Gandal - Price Manipulation in the Bitcoin Ecosystem  Blockchain at Berkeley  https://www.youtube.com/watch?v=k7rgse0gISI
// CESC2017 - Ren Zhang - Analyzing the Bitcoin Unlimited Mining Protocol  Blockchain at Berkeley  https://www.youtube.com/watch?v=P35M74KcLmA
// CESC2017 - Dmitry Meshkov - On Space-Scare Economy  Blockchain at Berkeley  https://www.youtube.com/watch?v=gBy-pu1kzdQ
// CESC2017 - Ryan Zurrer - Keepers  Blockchain at Berkeley  https://www.youtube.com/watch?v=2u60czobhBo
// CESC2017 - Ratul Saha - Power Splitting Games in Distributed Computation  Blockchain at Berkeley  https://www.youtube.com/watch?v=Ymg_sq9j_To
// CESC2017 - Sinclair Davidson - What is a Token?  Blockchain at Berkeley  https://www.youtube.com/watch?v=sIp11sadEyU
// CESC2017 - Rafael Pass - Thunderella  Blockchain at Berkeley  https://www.youtube.com/watch?v=DY2qhydRK_0
// CESC2017 - Silvio Micali - ALGORAND  Blockchain at Berkeley  https://www.youtube.com/watch?v=NbnZi9SImYY
// CESC2017 - Jordan Earls - Economics of Fees and Gas  Blockchain at Berkeley  https://www.youtube.com/watch?v=8Y_RgEIJisA
// Devcon2: Ethereum in 25 Minutes  Ethereum Foundation  https://www.youtube.com/watch?v=66SaEDzlmP4
// DEVCON1: Ethereum for Dummies - Dr. Gavin Wood  Ethereum Foundation  https://www.youtube.com/watch?v=U_LK0t_qaPo
// Integrating Ethereum Into Our Daily Lives - Jarrad Hope  Ethereum Foundation  https://www.youtube.com/watch?v=ZXZOdLuIAiE&t=156s
// A Deep Dive into the Colony Foundation Protocol - Dr. Aron Fischer and Elena Dimitrova  Ethereum Foundation  https://www.youtube.com/watch?v=zSF5fGPG4Ro&t=645s
// The Mauve Revolution - Vitalik Buterin  Ethereum Foundation  https://www.youtube.com/watch?v=bSdwqa3Yl0Q
// Devcon2: Regulatory Considerations for Dapp Development  Ethereum Foundation  https://www.youtube.com/watch?v=5J8BL60_zj8
// Plausible deniability - Daniel Nagy  Ethereum Foundation  https://www.youtube.com/watch?v=fOJgNPdwy18
// Livepeer Demo - Real time live streaming - Doug Petkanics 1/3  Ethereum Foundation  https://www.youtube.com/watch?v=MB-drzcRCD8
// Livepeer Demo - Real time live streaming - Doug Petkanics 2/3  Ethereum Foundation  https://www.youtube.com/watch?v=pQjwySXLm6Y
// Livepeer Demo - Real time live streaming - Doug Petkanics 3/3  Ethereum Foundation  https://www.youtube.com/watch?v=wpXBENzAmfg
// Ethereum ÐΞVcon-0: Ethereum 1.x: On blockchain interop and scaling  Ethereum Foundation  https://www.youtube.com/watch?v=fwEsXBDFk6c
// Vitalik Buterin reveals Ethereum at Bitcoin Miami 2014  Ethereum Foundation  https://www.youtube.com/watch?v=l9dpjN3Mwps
// DEVCON1: History of the Blockchain - Nick Szabo  Ethereum Foundation  https://www.youtube.com/watch?v=7Y3fWXA6d5k
// Viktor Tron - Distributed Database Services - Swarm Orange Summit 2017  Ethereum Foundation  https://www.youtube.com/watch?v=H9MclB0J6-A
//
// Playlist: Brainy movies & music for the weekend
// Slacker  Richard Linklater  https://www.youtube.com/watch?v=jB4xlYKAVCQ
// Dear and Desire  Stanley Kucrick  https://www.youtube.com/watch?time_continue=3&v=JbokkV1Roj4
// Thelonious Monk - Underground (HD FULL ALBUM)  Thelonious Monk  https://www.youtube.com/watch?v=eXKIEJ0ez98&t=333s
// RIP : A Remix Manifesto  Laurent LaSalle  https://vimeo.com/8040182
//
// Playlist: Cool projects out there
// Radar modular trade networks  Radar  https://vimeo.com/235936621
// SONM Chief Designer telling the story of SONM logo  Sonm  https://www.youtube.com/watch?v=CKa5gTPg6aY&feature=youtu.be&utm_source=SONM+ICO&utm_campaign=f7ea8ed9d6-EMAIL_CAMPAIGN_2017_09_30&utm_medium=email&utm_term=0_d62c57e178-f7ea8ed9d6-58374983
// SONM The Discovery Algorithm: How it Works  Sonm  https://www.youtube.com/watch?v=2MfOQcHooNo
// Introducing Numerai  Numerai  https://vimeo.com/205032211
// Building the Meta Model in Numerai  Numerai   https://www.youtube.com/watch?v=dhJnt0N497c
// Ethereum itself  Nucco Brain  https://vimeo.com/138853988
// Introducing the Render Token  Render Token  https://vimeo.com/231572056
// Santiment: A Better Way to Trade Crypto Markets  Santiment  https://vimeo.com/223019832
//
//
// Playlist: Around the Block
// Teaser 1 Around the Block  Paratii  is there already
// Teaser 2 Around the Block  Paratii  is there already
// Trailer Around the Block  Paratii  (provisory) https://www.youtube.com/watch?v=LR1fOVVxqZU&feature=youtu.be
]
export const videos = videosDef.map(videoInfo)
