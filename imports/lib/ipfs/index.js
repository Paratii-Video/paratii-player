'use strict'

/**
 * initIPFS - initiates Ipfs instance
 *
 * @param  {function} callback triggered when Ipfs node is ready
 */
function initIPFS (callback) {
  if (window.ipfs && window.ipfs.files) {
    callback()
  } else {
    $.getScript('https://unpkg.com/ipfs@0.25.1/dist/index.min.js', () => {
      console.log('Ipfs: ', Ipfs)
      window.ipfs = new Ipfs({
        repo: 'p2'
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
