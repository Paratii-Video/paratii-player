import { initIPFS } from '../../../lib/ipfs/index.js'
// import prettyBytes from 'pretty-bytes';
// import render from 'render-media'
// const Buffer = require('buffer')
// const render = require('render-media')
// const from2 = require('from2')
// const Multistream = require('multistream')
// const rangeStream = require('range-stream')
// const through = require('through2')
// const concat = require('concat-stream')
// const streamLib = require('stream')
// const toBlob = require('stream-to-blob')

export function createIPFSPlayer (templateInstance, currentVideo) {
  const templateDict = templateInstance.templateDict;


  // must do $.getScript instead of just packaging webtorrent with meteor
  // because meteors package.json is @#$@#$% broken
  // cf. https://github.com/meteor/meteor/issues/7067

  templateDict.set('status', 'loading IPFS File...');
  console.log('node: ', window.ipfs)
  const videoElement = document.querySelector('#video-player');
  const ipfsHash = currentVideo.src
  var mediaSource = new window.MediaSource()
  var queue = []
  var streamStarted = false
  var lastChunkIndex = 0
  var chunksPerAppend = 4
  var waiting = false
  mediaSource.addEventListener('sourceopen', sourceOpen, false)

  function sourceOpen (ev) {
    // var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    // TODO , dynamic codecs to handle more media formats.
    var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001F, mp4a.40.2"')

    sourceBuffer.addEventListener('updateend', (ev) => {
      if (lastChunkIndex + chunksPerAppend < queue.length) {
        // there are more chunks queued than minimum, append all.
	      console.log('appending chunks from ', lastChunkIndex, ' to ', queue.length - 1)
        let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length))
        sourceBuffer.appendBuffer(patch.buffer)
        lastChunkIndex = queue.length
      } else if (lastChunkIndex < queue.length) {
        // there are few chunks but less than minimum
        // for now , push them for testing.
	      console.log('got chunks but less than minimum')
        let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length))
        sourceBuffer.appendBuffer(patch.buffer)
        lastChunkIndex = queue.length
        waiting = true
      }
      console.log('updateend, queue: ', queue.length, ' last: ', lastChunkIndex)
    })

    initIPFS(() => {
      window.ipfs.files.cat(ipfsHash, (err, stream) => {
        if (err) throw err

        stream.on('data', (chunk) => {
          console.log('chunk ', chunk)

          if (chunk && chunk.length > 0) {
            queue.push(chunk)

            if (!streamStarted) {
              // stream hasn't started yet. this is first chunk.
              if (queue.length - lastChunkIndex === chunksPerAppend) {
                // there are enough for first append.
                console.log('first chunk(s) appending')
                let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length - lastChunkIndex))
                sourceBuffer.appendBuffer(patch.buffer)
                lastChunkIndex = queue.length
                streamStarted = true
                templateDict.set('status', 'Buffering Chunks...');

              }
            }

            if (waiting) {
              // we were waiting for enough chunks.
              // append what we got.
              let patch = Buffer.concat(queue.slice(lastChunkIndex, queue.length))
              sourceBuffer.appendBuffer(patch.buffer)
              lastChunkIndex = queue.length
              waiting = false
            }
          }
        })

        stream.on('end', () => {
          console.log('file end')
          console.log('queue length ', queue.length)
          console.log('last ', lastChunkIndex)
          templateDict.set('status', 'File buffered.');

        })
        stream.resume()
      })
    })
  }

  // add the mediaSource URL to the video src, this triggers 'sourceopen' event.
  videoElement.src = window.URL.createObjectURL(mediaSource)
}
