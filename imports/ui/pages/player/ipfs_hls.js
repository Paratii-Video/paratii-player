import paratiiIPFS from '../../../lib/ipfs/index.js'
// import utils from './utils.js'
// import hrtime from 'browser-process-hrtime'

global.Buffer = global.Buffer || require('buffer').Buffer
const Hls = require('hls.js')
const HlsjsIpfsLoader = require('hlsjs-ipfs-loader')
const { EventEmitter } = require('events')

function splitPath (path) {
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1)
  }

  return path.substring(6).split('/')
}

class HLSPlayer extends EventEmitter {
  constructor (opts) {
    super()

    if (!opts || !opts.video) {
      throw new Error('opts.video is required for HLSPlayer')
    }
    this.DAG = null

    this.videoEl = opts.video
    this.playerState = opts.playerState
    console.log('playerState: ', this.playerState.get('autoplay'))

    Hls.DefaultConfig.loader = HlsjsIpfsLoader
    Hls.DefaultConfig.debug = true
    if (Hls.isSupported()) {
      this.init()
    }
  }

  getDAG (callback) {
    if (!callback) callback = () => {}
    if (!window.ipfs) {
      return callback(null)
    }

    if (this.DAG && this.DAG !== null) {
      return callback(null, this.DAG)
    }
    console.log('getting parent DAG ' + splitPath(this.videoEl.src)[0])
    window.ipfs.object.get(splitPath(this.videoEl.src)[0], (err, res) => {
      if (err) throw err
      this.DAG = res.links
      console.log('DAG: ', res.links)
      callback(null, res.links)
    })
  }

  // stop () {
  //   hls.stopLoad()
  // }

  init () {
    // let metrics = {
    //   hash: this.videoEl.src,
    //   totalBytes: 0,
    //   received: 0,
    //   elapsed: null,
    //   started: null,
    //   finished: null,
    //   dupRatio: 0,
    //   queue: [],
    //   chunks: [],
    //   rates: {
    //     min: 0,
    //     max: 0,
    //     avg: 0,
    //     median: 0
    //   },
    //   overallRate: 0
    // }
    // var latestStat
    this.emit('status', 'creating IPFS instance')
    this.emit('status', 'IPFS Ready. Searching for ' + splitPath(this.videoEl.src)[0])
    this.video = document.getElementById('video-player')
    const hls = new Hls({
      ipfs: window.ipfs,
      ipfsHash: splitPath(this.videoEl.src)[0],
      enableWorker: true,
      startLevel: 0,
      autoLevelEnabled: false,
      autoStartLoad: true,
      maxLoadingDelay: 2
    })

    if (paratiiIPFS.isOnline()) {
      this.getDAG((err, dag) => {
        if (err) throw err
        hls.config.dag = dag
      })
    } else {
      paratiiIPFS.addOnReady(this.getDAG.bind(this))
    }

    // hls.config.ipfs = window.ipfs
    // hls.config.ipfsHash = splitPath(this.videoEl.src)[0]
    // emitter listener
    hls.config.emitter = this
    this.on('loader-status', (params) => {
      console.log('got ', params.event)
      if (params.event === 'DAG') {
        hls.config.dag = params.DAG
      }
    })

    // hls.config.startLevel = 2
    // hls.config.autoLevelCapping = -1
    // hls.config.maxLoadingDelay = 1
    hls.attachMedia(this.video)
    // Events monitoring
    hls.on(Hls.Events.MEDIA_ATTACHED, (event, data) => {
      this.emit('status', 'HLS mediaSource Attached')
      console.log('video and hls.js are now bound together !')
      // hls.loadSource('https://gateway.paratii.video/ipfs/'+splitPath(this.videoEl.src)[0]+'/master.m3u8');
      hls.loadSource('master.m3u8')
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.emit('ready')
        console.log('manifest loaded, found ' + data.levels.length + ' quality level , video: ', this.video)
        hls.startLoad()
        // hls.loadLevel = hls.levels.length - 2
      })
    })

    hls.on(Hls.Events.BUFFER_CREATED, (event, data) => {
      this.emit('status', 'HLS Buffer Created. awaiting chunks....')
    })

    hls.on(Hls.Events.BUFFER_APPENDING, (event, data) => {
      this.emit('status', 'HLS Appending Chunk')
      console.log('buffer Appending : ', data)

      // const lastHr = (metrics.chunks.length > 0)
      //     ? metrics.chunks[metrics.chunks.length - 1].hrtime
      //     : metrics.started
      //
      // metrics.chunks.push({
      //   time: Date.now(),
      //   hrtime: hrtime(),
      //   bytes: data.data.length,
      //   elaspedSinceLast: utils.duration(lastHr),
      //   rate: utils.speed(metrics.received, utils.duration(metrics.started))
      // })
      //
      // metrics.rates = utils.calcRates(metrics.chunks.map(chunk => chunk.rate))
      // metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
      //
      // if (!metrics.started) {
      //   metrics.started = hrtime()
      // }
      //
      // metrics.received += data.data.byteLength
      //
      // metrics.elapsed = utils.duration(metrics.started)
      // metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
      // metrics.rates = utils.calcRates(metrics.queue.map(chunk => chunk.rate))
      // let connectedPeers = (latestStat && latestStat.peers) ? latestStat.peers.length : 0
      //
      // this.emit('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
      //                    'duplication Ratio: ' + metrics.dupRatio.toFixed(2) + '% | ' +
      //                    'Connected Peers: ' + connectedPeers)
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      this.emit('status', 'HLS ERROR - Check Console')
      console.log('HLS ERROR : ', data)
    })

    hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
      console.log('HLS FRAG_LOADING  : ', data)
    })

    hls.on(Hls.Events.FRAG_LOADING_PROGRESS, (event, data) => {
      console.log('HLS FRAG_LOAD_PROGRESS: ', data)
    })

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      console.log('HLS FRAG_LOADED: ', data)
    })

    // hls.loadSource('master.m3u8')
    // hls.attachMedia(this.video)
    // hls.on(Hls.Events.MANIFEST_PARSED, () => {
    //   // video.play()
    //   this.emit('ready')
    //   console.info('[HLS] levels: ', hls.levels, ' | currentLevel: ', hls.levels[hls.currentLevel])
    //   // hls.nextLevel = hls.levels.length - 2
    //   hls.loadLevel = hls.levels.length - 2
    //
    //
    //
    //
    //   // setInterval(() => {
    //
    //     // if (hls.currentLevel <= 2) {
    //     //   hls.nextLevel = hls.currentLevel + 1
    //     //   console.log('[HLS] level up ', hls.levels[hls.currentLevel])
    //     // }
    //   // }, 5000)
    // })
    // console.log('video ', this.video)
    // this.video.addEventListener('DOMNodeRemoved', (ev) => {
    //   console.log('video switching. freeing HLS context')
    //   hls.destroy()
    // })

    // var self = this
    // -----------------------------------STATS---------------------------------
    // function updateStats () {
    //   metrics.elapsed = utils.duration(metrics.started)
    //   metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
    //   metrics.rates = utils.calcRates(metrics.queue.map(chunk => chunk.rate))
    //   if (!paratiiIPFS.isOnline()) {
    //     // clearInterval(pollStats)
    //     // return
    //   }
    //   // window.ipfs.swarm.peers((err, peers) => {
    //   //   if (err) throw err
    //   //   console.log('-----------------------Peers---------------------------')
    //   //   let msg = paratiiIPFS.protocol.createCommand('test')
    //   //   peers.map((peer) => {
    //   //     paratiiIPFS.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
    //   //       if (err) console.warn('[Paratii-protocol] Error ', err)
    //   //     })
    //   //
    //   //     if (peer.addr) {
    //   //       console.log(peer)
    //   //     }
    //   //   })
    //   // })
    //   latestStat = window.ipfs.bitswap.stat()
    //   metrics.dupRatio = (latestStat.dupDataReceived / metrics.received) * 100
    //   console.log('bitswap stat: ', window.ipfs.bitswap.stat())
    //   if (latestStat.dupDataReceived) {
    //     console.log('[IPFS]\nmeter: ', metrics.received, ' bytes\n',
    //         'dup Ratio: ', metrics.dupRatio, '%\n',
    //         'metrics.overallRate: ', metrics.overallRate, '\n',
    //         'metrics.rates: ', metrics.rates)
    //
    //     self.emit('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
    //                        'duplication Ratio: ' + metrics.dupRatio.toFixed(2) + '% | ' +
    //                        'Connected Peers: ' + latestStat.peers.length)
    //   } else {
    //     console.log('[IPFS]\nmeter: ', metrics.received, ' bytes\n',
    //         'dup Ratio: ', 0, '%\n',
    //         'metrics.overallRate: ', metrics.overallRate, '\n',
    //         'metrics.rates: ', metrics.rates)
    //
    //     self.emit('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
    //                        'duplication Ratio: ' + 0 + '% | ' +
    //                        'Connected Peers: ' + latestStat.peers.length)
    //   }
    // }

      // print peers and bitswap state for debugging ---------------------------
    // let pollStats = setInterval(() => {
    //   updateStats()
    // }, 10000)
      // -----------------------------------------------------------------------
  }
}

module.exports = HLSPlayer
