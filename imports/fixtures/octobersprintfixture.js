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
// Playlist: Into to the blockchain
  {
    _id: '1',
    title: 'Intro to the blockchain',
    description: '',
    url: 'intro-to-the-blockchain',
    videos: ['1', '2', '3', '4', '5', '6', '7']
  },
  // Playlist: Cryptoeconomy & Events
  {
    _id: '2',
    title: 'Cryptoeconomy & Events',
    description: '',
    url: 'Cryptoeconomy-and-events',
    videos: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115']
  },
  // Playlist: Brainy movies & music for the weekend
  {
    _id: '3',
    title: 'Cryptoeconomy & Events',
    description: '',
    url: 'Cryptoeconomy-and-events',
    videos: ['31', '32', '33']
  },
  // Playlist: Cool projects out there
  {
    _id: '4',
    title: 'Cool projects out there',
    description: '',
    url: 'cool-projects',
    videos: ['41', '42', '43', '44', '45', '46', '47', '48']
  },
  // Playlist: Around the Block
  {
    _id: '5',
    title: 'Around the Block',
    description: '',
    url: 'around-the-block',
    videos: ['55', '52', '53', '54', '55', '56']
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
  // Playlist: Cryptoeconomy & Events
  {
    _id: '101',
    title: 'CESC2017 - Balaji Srinivasan - Quantifying Decentralization',
    description: 'CESC2017 - Balaji Srinivasan - Quantifying Decentralization  Blockchain at Berkeley  https://www.youtube.com/watch?v=2GwN3vc_9ic'
  },
  {
    _id: '102',
    title: 'CESC2017 - Shin’ichiro Matsuo - Global Scale Research Networks and Cryptoeconomics  ',
    description: 'CESC2017 - Shin’ichiro Matsuo - Global Scale Research Networks and Cryptoeconomics  Blockchain at Berkeley  https://www.youtube.com/watch?v=G9Bp56y3X8U'
  },
  {
    _id: '103',
    title: 'CESC2017 - Vlad Zamfir - Cryptoeconomics in Casper ',
    description: 'CESC2017 - Vlad Zamfir - Cryptoeconomics in Casper  Blockchain at Berkeley  https://www.youtube.com/watch?v=5ScY7ruD_eg'
  },
  {
    _id: '104',
    title: 'CESC2017 - Eleftherios Kokoris-Kogias - Scalable and Efficient Distributed Ledgers  ',
    description: 'CESC2017 - Eleftherios Kokoris-Kogias - Scalable and Efficient Distributed Ledgers  Blockchain at Berkeley  https://www.youtube.com/watch?v=yZCe_ra2a8w'
  },
  {
    _id: '105',
    title: 'CESC2017 - Karl Floersch - Casper Proof of Stake  ',
    description: 'CESC2017 - Karl Floersch - Casper Proof of Stake  Blockchain at Berkeley  https://www.youtube.com/watch?v=ycF0WFHY5kc'
  },
  {
    _id: '106',
    title: 'CESC2017 - Ren Zhang - Analyzing the Bitcoin Unlimited Mining Protocol  Blockchain at Berkeley  https://www.youtube.com/watch?v=P35M74KcLmA',
    description: 'CESC2017 - Ren Zhang - Analyzing the Bitcoin Unlimited Mining Protocol  Blockchain at Berkeley  https://www.youtube.com/watch?v=P35M74KcLmA'
  },
  {
    _id: '107',
    title: 'CESC2017 - Dmitry Meshkov - On Space-Scare Economy  Blockchain at Berkeley  https://www.youtube.com/watch?v=gBy-pu1kzdQ',
    description: 'CESC2017 - Dmitry Meshkov - On Space-Scare Economy  Blockchain at Berkeley  https://www.youtube.com/watch?v=gBy-pu1kzdQ'
  },
  {
    _id: '108',
    title: 'CESC2017 - Ryan Zurrer - Keepers  Blockchain at Berkeley  https://www.youtube.com/watch?v=2u60czobhBo',
    description: 'CESC2017 - Ryan Zurrer - Keepers  Blockchain at Berkeley  https://www.youtube.com/watch?v=2u60czobhBo'
  },
  {
    _id: '109',
    title: 'CESC2017 - Ratul Saha - Power Splitting Games in Distributed Computation  Blockchain at Berkeley  https://www.youtube.com/watch?v=Ymg_sq9j_To',
    description: 'CESC2017 - Ratul Saha - Power Splitting Games in Distributed Computation  Blockchain at Berkeley  https://www.youtube.com/watch?v=Ymg_sq9j_To'
  },
  {
    _id: '110',
    title: 'CESC2017 - Sinclair Davidson - What is a Token?  Blockchain at Berkeley  https://www.youtube.com/watch?v=sIp11sadEyU',
    description: 'CESC2017 - Sinclair Davidson - What is a Token?  Blockchain at Berkeley  https://www.youtube.com/watch?v=sIp11sadEyU'
  },
  {
    _id: '111',
    title: 'CESC2017 - Rafael Pass - Thunderella  Blockchain at Berkeley  https://www.youtube.com/watch?v=DY2qhydRK_0',
    description: 'CESC2017 - Rafael Pass - Thunderella  Blockchain at Berkeley  https://www.youtube.com/watch?v=DY2qhydRK_0'
  },
  {
    _id: '112',
    title: 'CESC2017 - Silvio Micali - ALGORAND  Blockchain at Berkeley  https://www.youtube.com/watch?v=NbnZi9SImYY',
    description: 'CESC2017 - Silvio Micali - ALGORAND  Blockchain at Berkeley  https://www.youtube.com/watch?v=NbnZi9SImYY'
  },
  {
    _id: '113',
    title: 'CESC2017 - Jordan Earls - Economics of Fees and Gas  Blockchain at Berkeley  https://www.youtube.com/watch?v=8Y_RgEIJisA',
    description: 'CESC2017 - Jordan Earls - Economics of Fees and Gas  Blockchain at Berkeley  https://www.youtube.com/watch?v=8Y_RgEIJisA'
  },
  {
    _id: '114',
    title: 'Devcon2: Ethereum in 25 Minutes  Ethereum Foundation  https://www.youtube.com/watch?v=66SaEDzlmP4',
    description: 'Devcon2: Ethereum in 25 Minutes  Ethereum Foundation  https://www.youtube.com/watch?v=66SaEDzlmP4'
  },
  {
    _id: '115',
    title: 'DEVCON1: Ethereum for Dummies - Dr. Gavin Wood  Ethereum Foundation  https://www.youtube.com/watch?v=U_LK0t_qaPo',
    description: 'DEVCON1: Ethereum for Dummies - Dr. Gavin Wood  Ethereum Foundation  https://www.youtube.com/watch?v=U_LK0t_qaPo'
  },
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

  // Playlist: Brainy movies & music for the weekend
  // Slacker  Richard Linklater  https://www.youtube.com/watch?v=jB4xlYKAVCQ
  // Dear and Desire  Stanley Kucrick  https://www.youtube.com/watch?time_continue=3&v=JbokkV1Roj4
  // Thelonious Monk - Underground (HD FULL ALBUM)  Thelonious Monk  https://www.youtube.com/watch?v=eXKIEJ0ez98&t=333s
  // RIP : A Remix Manifesto  Laurent LaSalle  https://vimeo.com/8040182
  //   {
  //     _id: '31',
  //     title: 'Slacker  Richard Linklater  https://www.youtube.com/watch?v=jB4xlYKAVCQ',
  // description: 'Slacker  Richard Linklater  https://www.youtube.com/watch?v=jB4xlYKAVCQ',
  // description:'// Dear and Desire  Stanley Kucrick  https://www.youtube.com/watch?time_continue=3&v=JbokkV1Roj4',
  // descriptiontitle:'// Dear and Desire  Stanley Kucrick  https://www.youtube.com/watch?time_continue=3&v=JbokkV1Roj4',
  // title: '  // Thelonious Monk - Underground (HD FULL ALBUM)  Thelonious Monk  https://www.youtube.com/watch?v=eXKIEJ0ez98&t=333s',
  // description: '  // Thelonious Monk - Underground (HD FULL ALBUM)  Thelonious Monk  https://www.youtube.com/watch?v=eXKIEJ0ez98&t=333s',
  // title: '  // RIP : A Remix Manifesto  Laurent LaSalle  https://vimeo.com/8040182',
  // description: '  // RIP : A Remix Manifesto  Laurent LaSalle  https://vimeo.com/8040182',
  //   },

  // Playlist: Cool projects out there
  {
    _id: '41',
    title: 'Radar modular trade networks',
    description: 'Radar modular trade networks  Radar  https://vimeo.com/235936621'
  },
  {
    _id: '42',
    title: 'SONM Chief Designer telling the story of SONM logo',
    description: 'SONM Chief Designer telling the story of SONM logo  Sonm  https://www.youtube.com/watch?v=CKa5gTPg6aY&feature=youtu.be&utm_source=SONM+ICO&utm_campaign=f7ea8ed9d6-EMAIL_CAMPAIGN_2017_09_30&utm_medium=email&utm_term=0_d62c57e178-f7ea8ed9d6-58374983'
  },
  {
    _id: '43',
    title: 'SONM The Discovery Algorithm: How it Works',
    description: 'SONM The Discovery Algorithm: How it Works  Sonm  https://www.youtube.com/watch?v=2MfOQcHooNo'
  },
  {
    _id: '44',
    title: 'Introducing Numerai',
    description: 'Introducing Numerai  Numerai  https://vimeo.com/205032211'
  },
  {
    _id: '45',
    title: 'Building the Meta Model in Numerai',
    description: 'Building the Meta Model in Numerai  Numerai   https://www.youtube.com/watch?v=dhJnt0N497c'
  },
  {
    _id: '46',
    title: 'Ethereum itself',
    description: 'Ethereum itself  Nucco Brain  https://vimeo.com/138853988'
  },

  {
    _id: '47',
    title: 'Introducing the Render Token',
    description: 'Introducing the Render Token  Render Token  https://vimeo.com/231572058'
  },

  {
    _id: '48',
    title: 'Santiment: A Better Way to Trade Crypto Markets',
    description: 'Santiment: A Better Way to Trade Crypto Markets  Santiment  https://vimeo.com/223019832'
  },

  // Playlist: Around the Block
  // Teaser 2 Around the Block  Paratii  is there already
  // Trailer Around the Block  Paratii  (provisory) https://www.youtube.com/watch?v=LR1fOVVxqZU&feature=youtu.be
  {
    _id: '51',
    title: 'Around the Block - Teaser 1',
    description: 'First teaser of Around the Block ',
    thumb: '/img/cover/teaser1.jpg',
    duration: '03:22',
    price: 0,
    uploader: {
      address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
      name: 'Paratii',
      avatar: 'http://i.pravatar.cc/150?img=4'
    },
    tags: ['WEBTORRENT', 'AROUND THE BLOCK'],
    src: 'magnet:?xt=urn:btih:978c3df6e8e3562b18613e36086bf2592093db90&dn=Around+The+Block+Series+-+Teaser+1+-+Sergio+Lerner.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
    mimetype: 'video/mp4'
  },
  {
    _id: '52',
    title: 'Around the Block - Teaser 16',
    description: 'Another teaser of Around the Block ',
    thumb: '/img/cover/teaser16.jpg',
    duration: '03:22',
    price: 14,
    uploader: {
      // address: web3.eth.accounts[2],
      address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
      name: 'Paratii',
      avatar: 'http://i.pravatar.cc/150?img=4'
    },
    tags: ['WEBTORRENT', 'AROUND THE BLOCK'],
    src: 'magnet:?xt=urn:btih:826bfc8069e71418c215179f12546460e3364b5a&dn=Around_The_Block_Teaser_16.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
    mimetype: 'video/mp4'
  },
  {
    _id: '53',
    title: 'Around The Block Series - Teaser 1 - Sergio Lerner',
    description: 'Around the Block is a humane account of the most fascinating social experiment ever played in the internet, in the form of a documentary series. This is just a teaser. Rollout of 6 free episodes begins in Autumn 2017. ',
    thumb: '/img/cover/teaser1.jpg',
    duration: '01:57',
    price: 0,
    uploader: {
      address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
      name: 'Paratii',
      avatar: 'http://i.pravatar.cc/150?img=4'
    },
    // src: '/ipfs/QmeqDeRWSghNQwheSt6R8bB7wd2tgAo1KYT4VGLsbDdgWx',
    src: 'https://gateway.ipfs.io/ipfs/QmayHsEJfu1Pq5q1k3c9f9z14fh6AyJsam4LFbSQYWMXZt',
    mimetype: 'video/mp4'

  }, {
    _id: '54',
    title: 'Around The Block Series - Teaser 16 - Alex Van De Sande',
    description: 'IPFS EXAMPLE video',
    thumb: '/img/cover/teaser16.jpg',
    duration: '01:46',
    price: 0,
    uploader: {
      address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
      name: 'Paratii',
      avatar: 'http://i.pravatar.cc/150?img=4'
    },
    tags: ['IPFS', 'Around The Block'],
    // src: '/ipfs/QmR6QvFUBhHQ288VmpHQboqzLmDrrC2fcTUyT4hSMCwFyj',
    src: 'https://gateway.ipfs.io/ipfs/QmcSHvFsGEU36viAkXo5PAkz1YgsorzT5LXR8uAnugJ7Hg',
    mimetype: 'video/mp4'
  }
]
export const videos = videosDef.map(videoInfo)
