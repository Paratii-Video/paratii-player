import paratiiIPFS from '../../../lib/ipfs/index.js'
import utils from './utils.js'
import hrtime from 'browser-process-hrtime'

global.Buffer = global.Buffer || require('buffer').Buffer
const Hls = require('hls.js')
const HlsjsIpfsLoader = require('hlsjs-ipfs-loader')

function splitPath (path) {
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1)
  }

  return path.substring(6).split('/')
}

export function createIPFSPlayer (templateInstance, currentVideo) {
  const templateDict = templateInstance.playerState
  let metrics = {
    hash: currentVideo.src,
    totalBytes: 0,
    received: 0,
    elapsed: null,
    started: null,
    finished: null,
    dupRatio: 0,
    queue: [],
    chunks: [],
    rates: {
      min: 0,
      max: 0,
      avg: 0,
      median: 0
    },
    overallRate: 0
  }
  var latestStat

  templateDict.set('status', 'creating IPFS instance')
  paratiiIPFS.initIPFS(() => {
    templateDict.set('status', 'IPFS Ready. Searching for ' + splitPath(currentVideo.src)[0])
    // -----------------[Paratii protocol testing]------------------------------
    paratiiIPFS.protocol.notifications.on('message:new', (peerId, msg) => {
      if (msg && msg.hello) {
        console.log('[PROTOCOL] Got peer ', peerId.toB58String(), ' | PTI: ', msg.hello.eth.toString())
      }
    })
    // -------------------------------------------------------------------------

    Hls.DefaultConfig.loader = HlsjsIpfsLoader
    Hls.DefaultConfig.debug = true

    function updateStats () {
      metrics.elapsed = utils.duration(metrics.started)
      metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
      metrics.rates = utils.calcRates(metrics.queue.map(chunk => chunk.rate))
      if (!paratiiIPFS.isOnline()) {
        clearInterval(pollStats)
        return
      }
      window.ipfs.swarm.peers((err, peers) => {
        if (err) throw err
        console.log('-----------------------Peers---------------------------')
        let msg = paratiiIPFS.protocol.createCommand('test')
        peers.map((peer) => {
          paratiiIPFS.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
            if (err) console.warn('[Paratii-protocol] Error ', err)
          })

          if (peer.addr) {
            console.log(peer)
          }
        })
      })
      latestStat = window.ipfs.bitswap.stat()
      metrics.dupRatio = (latestStat.dupDataReceived / metrics.received) * 100
      console.log('bitswap stat: ', window.ipfs.bitswap.stat())
      if (latestStat.dupDataReceived) {
        console.log('[IPFS]\nmeter: ', metrics.received, ' bytes\n',
          'dup Ratio: ', metrics.dupRatio, '%\n',
          'metrics.overallRate: ', metrics.overallRate, '\n',
          'metrics.rates: ', metrics.rates)

        templateDict.set('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
                         'duplication Ratio: ' + metrics.dupRatio.toFixed(2) + '% | ' +
                         'Connected Peers: ' + latestStat.peers.length)
      } else {
        console.log('[IPFS]\nmeter: ', metrics.received, ' bytes\n',
          'dup Ratio: ', 0, '%\n',
          'metrics.overallRate: ', metrics.overallRate, '\n',
          'metrics.rates: ', metrics.rates)

        templateDict.set('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
                         'duplication Ratio: ' + 0 + '% | ' +
                         'Connected Peers: ' + latestStat.peers.length)
      }
    }

    // print peers and bitswap state for debugging ---------------------------
    let pollStats = setInterval(() => {
      updateStats()
    }, 10000)
    // -----------------------------------------------------------------------

    if (Hls.isSupported()) {
      const video = document.getElementById('video-player')
      const hls = new Hls()

      // Events monitoring
      hls.on(Hls.Events.MEDIA_ATTACHED, (event, data) => {
        templateDict.set('status', 'HLS mediaSource Attached')
      })

      hls.on(Hls.Events.BUFFER_CREATED, (event, data) => {
        templateDict.set('status', 'HLS Buffer Created. awaiting chunks....')
      })

      hls.on(Hls.Events.BUFFER_APPENDING, (event, data) => {
        templateDict.set('status', 'HLS Appending Chunk')
        console.log('buffer Appending : ', data)

        const lastHr = (metrics.chunks.length > 0)
          ? metrics.chunks[metrics.chunks.length - 1].hrtime
          : metrics.started

        metrics.chunks.push({
          time: Date.now(),
          hrtime: hrtime(),
          bytes: data.data.length,
          elaspedSinceLast: utils.duration(lastHr),
          rate: utils.speed(metrics.received, utils.duration(metrics.started))
        })

        metrics.rates = utils.calcRates(metrics.chunks.map(chunk => chunk.rate))
        metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))

        if (!metrics.started) {
          metrics.started = hrtime()
        }

        metrics.received += data.data.byteLength

        metrics.elapsed = utils.duration(metrics.started)
        metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
        metrics.rates = utils.calcRates(metrics.queue.map(chunk => chunk.rate))
        let connectedPeers = (latestStat && latestStat.peers) ? latestStat.peers.length : 0

        templateDict.set('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
                         'duplication Ratio: ' + metrics.dupRatio.toFixed(2) + '% | ' +
                         'Connected Peers: ' + connectedPeers)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        templateDict.set('status', 'HLS ERROR - Check Console')
        console.log('HLS ERROR : ', data)
      })

      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        // templateDict.set('status', 'HLS FRAG_LOADING')
        console.log('HLS FRAG_LOADING  : ', data)
      })

      hls.on(Hls.Events.FRAG_LOADING_PROGRESS, (event, data) => {
        // templateDict.set('status', 'HLS FRAG_LOAD_PROGRESS')
        console.log('HLS FRAG_LOAD_PROGRESS: ', data)
      })

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        // templateDict.set('status', 'HLS FRAG_LOADED')
        console.log('HLS FRAG_LOADED: ', data)
      })

      hls.config.ipfs = window.ipfs
      hls.config.ipfsHash = splitPath(currentVideo.src)[0]
      hls.loadSource('master.m3u8')
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // video.play()
      })
    }
  })
}
