'use strict'
import { initIPFS } from '../../../lib/ipfs/index.js'
var dropAreaEl, statusEl

document.addEventListener('DOMContentLoaded', (e) => {
  console.log('DOMContentLoaded', document)
  dropAreaEl = document.querySelector('body')

  dropAreaEl.addEventListener('dragover', dragenter)
  dropAreaEl.addEventListener('dragenter', dragenter)
  dropAreaEl.addEventListener('drop', drop)
  // var storageQuota = window.StorageQuota
  // storageQuota.requestPersistentQuota(100 * 1024 * 1024).then((storageInfo) => {
  //   console.log('got storageInfo ', storageInfo)
  // })
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
      if (granted) {
        console.log('Storage will not be cleared except by explicit user action')
      } else {
        console.log('Storage may be cleared by the UA under storage pressure.')
      }
    })
  }
})

function dragenter (ev) {
  statusEl = document.querySelector('.statusContainer')

  ev.stopPropagation()
  ev.preventDefault()
  console.log('dragenter', ev)
}

function drop (ev) {
  console.log('drop', ev)
  const dt = ev.dataTransfer
  const files = dt.files

  let file

  if (!ev) {
    file = files[0]
  } else {
    dragenter(ev)
    file = ev.dataTransfer.files[0]
  }

  if (file) {
    // parse it,  send it to IPFS
    console.log('file ', file)
    statusEl.innerHTML = 'adding ' + file.name + ' to IPFS'

    addToIPFS(file)
  }
}

function addToIPFS (file) {
  function readFileContents (file) {
    return new Promise((resolve) => {
      const reader = new window.FileReader()
      reader.onload = (event) => {
        console.log('reader onload ', event)
        resolve(event.target.result)
      }
      reader.readAsArrayBuffer(file)
    })
  }

  initIPFS(() => {
    console.log('[IPFS] uploader instance ready.')

    readFileContents(file).then((buf) => {
      console.log('[IPFS] add \t: file.name: ', file.name, ' contentsize: ', buf.byteLength)
      // TODO
      // if there is transcoding required, it should be done before adding the file.
      window.ipfs.files.add([{
        path: file.name,
        content: new window.ipfs.types.Buffer(buf)
      }]).then((files) => {
        // file is added to IPFS
        // TODO
        // - cat the file from a peer we control to make sure it's available if the
        // user closes the browser tab.
        // - add the hash to a localStorage list.
        console.log('added file ', files)
        statusEl.innerHTML = 'DONE! file ' + files[0].path + ' to IPFS as ' + files[0].hash
      }).catch((err) => {
        if (err) throw err
      })
    })
  })
}
