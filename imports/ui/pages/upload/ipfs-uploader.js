'use strict'
import { initIPFS } from '../../../lib/ipfs/index.js'

const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
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
  if (ev) {
    dragenter(ev)
  }

  let files = []
  for (let i = 0; i < ev.dataTransfer.files.length; i++) {
    files.push(ev.dataTransfer.files[i])
  }
  //
  // if (files && files.length > 0) {
  //   // parse it,  send it to IPFS
  //   console.log('file ', file);
  //   statusEl.innerHTML = 'adding ' + file.name + ' to IPFS';
  //
  // }
  if (files && files.length) {
    statusEl.innerHTML = files.map((e) => `Adding ${e.name}`).join('<br>')
    addToIPFS(files)
  }
}

function addToIPFS (files) {
  var fileSize = 0
  var total = 0
  function updateProgress (chunkLength) {
    total += chunkLength
    console.log('Progress \t', total, ' / ', fileSize, ' = ', Math.floor((total / fileSize) * 100))
  }

  initIPFS(() => {
    setInterval(() => {
      window.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
        console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
      })
    }, 5000)

    pull(
      pull.values(files),
      pull.through((file) => {
        console.log('Adding ', file)
        fileSize = file.size
        total = 0
      }),
      pull.asyncMap((file, cb) => pull(
        pull.values([{
          path: file.name,
          // content: pullFilereader(file)
          content: pull(
            pullFilereader(file),
            pull.through((chunk) => updateProgress(chunk.length))
          )
        }]),
        window.ipfs.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
        pull.collect((err, res) => {
          if (err) {
            return cb(err)
          }
          const file = res[0]
          console.log('Adding %s finished', file.path)

          statusEl.innerHTML += `Added ${file.path} as ${file.hash} ` + '<br>'
          cb(null, file)
        }))),
      pull.collect((err, files) => {
        if (err) {
          throw err
        }
        if (files && files.length) {
          statusEl.innerHTML += `All Done!`
        }
      })
    )
  })
}
