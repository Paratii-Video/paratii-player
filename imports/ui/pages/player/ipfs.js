import { initIPFS } from '../../../lib/ipfs/index.js'
import utils from './utils.js'
import hrtime from 'browser-process-hrtime'

// FRAGMENTING COMMAND to convert mp4 to fragmented mp4
// This still has issues. like the 0 duration.
// ffmpeg -i freedom.mp4 -strict -2 -movflags frag_keyframe+empty_moov+default_base_moof fragfreedom.mp4

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
  // must do $.getScript instead of just packaging webtorrent with meteor
  // because meteors package.json is @#$@#$% broken
  // cf. https://github.com/meteor/meteor/issues/7067

  templateDict.set('status', 'creating IPFS instance')
  const videoElement = document.querySelector('#video-player')
  const ipfsHash = currentVideo.src
  var mediaSource = new window.MediaSource()
  // var meter = 0
  // var queue = []
  var streamStarted = false
  var lastChunkIndex = 0
  var chunksPerAppend = 3
  var waiting = false
  var latestStat
  mediaSource.addEventListener('sourceopen', sourceOpen, false)

  function sourceOpen (ev) {
    // TODO , dynamic codecs to handle more media formats.
    // var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    // var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001F, mp4a.40.2"')
    var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E, mp4a.40.2"')

    function appendBuffer () {
      let patch = Buffer.concat(metrics.queue.slice(lastChunkIndex, metrics.queue.length))
      sourceBuffer.appendBuffer(patch.buffer)
      metrics.received += patch.buffer.byteLength
      lastChunkIndex = metrics.queue.length

      metrics.elapsed = utils.duration(metrics.started)
      metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
      metrics.rates = utils.calcRates(metrics.queue.map(chunk => chunk.rate))

      templateDict.set('status', 'Download: ' + (metrics.overallRate / 1000) + 'KB/s | ' +
                       'duplication Ratio: ' + metrics.dupRatio.toFixed(2) + '% | ' +
                       'Connected Peers: ' + latestStat.peers.length)
    }

    sourceBuffer.addEventListener('updateend', (ev) => {
      if (lastChunkIndex + chunksPerAppend < metrics.queue.length) {
        // there are more chunks queued than minimum, append all.
        console.log('appending chunks from ', lastChunkIndex, ' to ', metrics.queue.length - 1)
        appendBuffer()
      } else if (lastChunkIndex < metrics.queue.length) {
        // there are few chunks but less than minimum
        // for now , push them for testing.
        console.log('got chunks but less than minimum')
        appendBuffer()
      }

      waiting = true
      console.log('fragment updateend, queue: ', metrics.queue.length, ' last: ', lastChunkIndex)

      // if (window.ipfs.bitswap.stat() && window.ipfs.bitswap.stat().wantlist.length === 0) {
      //   mediaSource.endOfStream()
      //   console.log('Stream ended')
      // }
    })

    initIPFS(() => {
      // window.ipfs is available.
      function updateStats () {
        metrics.elapsed = utils.duration(metrics.started)
        metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))
        metrics.rates = utils.calcRates(metrics.queue.map(chunk => chunk.rate))

        window.ipfs.swarm.peers((err, peers) => {
          if (err) throw err
          peers.map((peer) => {
            if (peer.addr) {
              console.log(peer.addr.toString())
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

      templateDict.set('status', 'searching for ' + ipfsHash)

      // window.ipfs.files.cat(ipfsHash, (err, stream) => {
      window.ipfs.files.get(ipfsHash, (err, filesStream) => {
        if (err) throw err
        filesStream.on('data', (stream) => {
          if (err) throw err
          console.log('stream: ', stream)
          metrics.totalBytes = stream.size
          if (stream.content) {
            stream.content.on('data', (chunk) => {
              // console.log('chunk ', chunk)

              // if (chunk && chunk.length > 0) {
              if (chunk) {
                metrics.queue.push(chunk)

                metrics.received += chunk.length
                const lastHr = (metrics.chunks.length > 0)
                  ? metrics.chunks[metrics.chunks.length - 1].hrtime
                  : metrics.started

                metrics.chunks.push({
                  time: Date.now(),
                  hrtime: hrtime(),
                  bytes: chunk.length,
                  elaspedSinceLast: utils.duration(lastHr),
                  rate: utils.speed(metrics.received, utils.duration(metrics.started))
                })

                metrics.rates = utils.calcRates(metrics.chunks.map(chunk => chunk.rate))
                metrics.overallRate = utils.speed(metrics.received, utils.duration(metrics.started))

                if (!metrics.started) {
                  metrics.started = hrtime()
                }
                if (!streamStarted) {
                  templateDict.set('status', 'awaiting first fragment (' + (chunksPerAppend - metrics.queue.length + 1) + ' chunks )')
                  // stream hasn't started yet. this is first fragment.
                  if (metrics.queue.length - lastChunkIndex === chunksPerAppend) {
                    // there are enough for first append.
                    console.log('first chunk(s) appending')
                    appendBuffer()
                    streamStarted = true
                    templateDict.set('status', 'Buffering Chunks...')
                  }
                }

                if (waiting) {
                  // we were waiting for enough chunks.
                  // append what we got.
                  appendBuffer()
                  waiting = false
                }
              }

              stream.content.resume()
            })

            stream.content.on('end', () => {
              console.log('file end')
              console.log('queue length ', metrics.queue.length)
              console.log('last ', lastChunkIndex)
              templateDict.set('status', 'File buffered. metrics.dupRatio: ', metrics.dupRatio.toFixed(2) + '%')
              clearInterval(pollStats)
            })
            stream.content.resume()
          }
        })
      })
    })
  }

  // add the mediaSource URL to the video src, this triggers 'sourceopen' event.
  videoElement.src = window.URL.createObjectURL(mediaSource)
}
