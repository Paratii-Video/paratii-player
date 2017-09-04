import { initIPFS } from '../../../lib/ipfs/index.js'

// FRAGMENTING COMMAND to convert mp4 to fragmented mp4
// This still has issues. like the 0 duration.
// ffmpeg -i freedom.mp4 -strict -2 -movflags frag_keyframe+empty_moov+default_base_moof fragfreedom.mp4

export function createIPFSPlayer (templateInstance, currentVideo) {
  const templateDict = templateInstance.playerState

  // must do $.getScript instead of just packaging webtorrent with meteor
  // because meteors package.json is @#$@#$% broken
  // cf. https://github.com/meteor/meteor/issues/7067

  templateDict.set('status', 'creating IPFS instance')
  const videoElement = document.querySelector('#video-player')
  const ipfsHash = currentVideo.src
  var mediaSource = new window.MediaSource()
  var meter = 0
  var queue = []
  var streamStarted = false
  var lastChunkIndex = 0
  var chunksPerAppend = 3
  var waiting = false
  mediaSource.addEventListener('sourceopen', sourceOpen, false)

  function sourceOpen (ev) {
    // TODO , dynamic codecs to handle more media formats.
    // var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    // var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001F, mp4a.40.2"')
    var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E, mp4a.40.2"')

    sourceBuffer.addEventListener('updateend', (ev) => {
      if (lastChunkIndex + chunksPerAppend < queue.length) {
        // there are more chunks queued than minimum, append all.
        console.log('appending chunks from ', lastChunkIndex, ' to ', queue.length - 1)
        let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length))
        sourceBuffer.appendBuffer(patch.buffer)
        meter += patch.buffer.byteLength
        lastChunkIndex = queue.length
      } else if (lastChunkIndex < queue.length) {
        // there are few chunks but less than minimum
        // for now , push them for testing.
        console.log('got chunks but less than minimum')
        let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length))
        sourceBuffer.appendBuffer(patch.buffer)
        meter += patch.buffer.byteLength
        lastChunkIndex = queue.length
      }

      waiting = true
      console.log('fragment updateend, queue: ', queue.length, ' last: ', lastChunkIndex)

      // if (window.ipfs.bitswap.stat() && window.ipfs.bitswap.stat().wantlist.length === 0) {
      //   mediaSource.endOfStream()
      //   console.log('Stream ended')
      // }
    })

    initIPFS(() => {
      // print peers and bitswap state for debugging ---------------------------
      setInterval(() => {
        window.ipfs.swarm.peers((err, peers) => {
          if (err) throw err
          console.log(peers.length + ' peers in the swarm')
          peers.map((peer) => {
            if (peer.addr) {
              console.log(peer.addr.toString())
            }
          })
        })
        console.log('bitswap stat: ', window.ipfs.bitswap.stat())
        console.log('[IPFS] meter: ', meter, ' bytes')
      }, 10000)
      // -----------------------------------------------------------------------

      templateDict.set('status', 'searching for ' + ipfsHash)

      window.ipfs.files.cat(ipfsHash, (err, stream) => {
        if (err) throw err

        stream.on('data', (chunk) => {
          console.log('chunk ', chunk)

          // if (chunk && chunk.length > 0) {
          if (chunk) {
            queue.push(chunk)

            if (!streamStarted) {
              templateDict.set('status', 'awaiting first fragment (' + (chunksPerAppend - queue.length + 1) + ' chunks )')
              // stream hasn't started yet. this is first fragment.
              if (queue.length - lastChunkIndex === chunksPerAppend) {
                // there are enough for first append.
                console.log('first chunk(s) appending')
                let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length - lastChunkIndex))
                sourceBuffer.appendBuffer(patch.buffer)
                meter += patch.buffer.byteLength
                lastChunkIndex = queue.length
                streamStarted = true
                templateDict.set('status', 'Buffering Chunks...')
              }
            }

            if (waiting) {
              // we were waiting for enough chunks.
              // append what we got.
              let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length))
              sourceBuffer.appendBuffer(patch.buffer)
              meter += patch.buffer.byteLength
              lastChunkIndex = queue.length
              waiting = false
            }
          }

          stream.resume()
        })

        stream.on('end', () => {
          console.log('file end')
          console.log('queue length ', queue.length)
          console.log('last ', lastChunkIndex)
          templateDict.set('status', 'File buffered.')
        })
        stream.resume()
      })
    })
  }

  // add the mediaSource URL to the video src, this triggers 'sourceopen' event.
  videoElement.src = window.URL.createObjectURL(mediaSource)
}
