'use strict'
// const WebRTCStar = require('libp2p-webrtc-star')
// const WS = require('libp2p-websockets')

/**
 * initIPFS - initiates Ipfs instance
 *
 * @param  {function} callback triggered when Ipfs node is ready
 */
function initIPFS (callback) {
  if (window.ipfs && window.ipfs.files) {
    callback()
  } else {
    $.getScript('https://unpkg.com/ipfs@0.25.1/dist/index.js', () => {
      console.log('Ipfs: ', Ipfs)
      // const wstar = new WebRTCStar()
      window.ipfs = new Ipfs({
        repo: String(Math.random()),
        config: {
          Addresses: {
            Swarm: [
              '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss',
              // run our own star-signal server.
              // https://github.com/libp2p/js-libp2p-webrtc-star
              '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss'
            ]
          },
          Bootstrap: [
            // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
            // https://github.com/ipfs/js-ipfs/issues/941
            '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
            '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS'
          ]
        },
        libp2p: {
          modules: {
            // transport: [new WS(), wstar]
          }
        }
      })

      var peerInfo

      window.ipfs.on('ready', () => {
        console.log('[IPFS] node Ready.')
        window.ipfs.id().then((id) => {
          peerInfo = id
          console.log('[IPFS] id: ', id)
          callback()
        })
      })

      window.ipfs.on('error', (err) => {
        if (err) {
          console.log('IPFS node ', window.ipfs)
          console.error('[IPFS] ', err)
          throw err
        }
      })
    })
  }
}

module.exports = { initIPFS }
