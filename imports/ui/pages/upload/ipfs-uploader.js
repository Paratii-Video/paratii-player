'use strict'
import paratiiIPFS from '../../../lib/ipfs/index.js'
// import { initIPFS } from '../../../lib/ipfs/index.js'

const pull = require('pull-stream')
const pullFilereader = require('pull-filereader')
var dropAreaEl, statusEl, titleEl, formContainer

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

function renderForm (formEl, videoObject, cb) {
  // formEl.innerHTML = '<form class="upload-form" method="POST" action="#">'
  formEl.innerHTML += 'Video Title:'
  formEl.innerHTML += '<input name="title" id="input-title" type="text" class="form-control textbox">'
  formEl.innerHTML += '<h5>screenshots</h5><ul>'

  let screenshots = videoObject.screenshots
  for (let i = 0; i < screenshots.length; i++) {
    formEl.innerHTML += '<li><input type="radio" name="screenshot" value="https://gateway.paratii.video/ipfs/' + videoObject.master.hash + '/' + screenshots[i] + '">'
    formEl.innerHTML += '<img width="240" src="https://gateway.paratii.video/ipfs/' + videoObject.master.hash + '/' + screenshots[i] + '"></li>'
  }

  formEl.innerHTML += '</ul>'
  formEl.innerHTML += '<br><input class="btn btn-default" type="submit" value="submit">'

  formEl.addEventListener('submit', (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    console.log(formEl.querySelector('input[type="radio"]:checked').value)
    console.log('ev target: ', ev)
    saveVideo(videoObject)
  })
}

function saveVideo (videoObject, cb) {
  titleEl = document.querySelector('#input-title')
  console.log('titleEl: ', titleEl)

  Meteor.call('videos.create', {
    id: String(Math.random()).split('.')[1],
    title: titleEl.value,
    price: 0.0,
    thumb: formContainer.querySelector('input[type="radio"]:checked').value,
    src: '/ipfs/' + videoObject.master.hash,
    mimetype: 'video/mp4',
    stats: {
      likes: 0,
      dislikes: 0
    }}, (err, videoId) => {
      if (err) throw err
      console.log('[upload] Video Uploaded: ', videoId)
      formContainer.innerHTML += '\n <br>Video Uploaded go to <b><a href="/play/' + videoId + '">/play/' + videoId + '</a></b>\n'
    })
}

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

  paratiiIPFS.initIPFS(() => {
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

          statusEl.innerHTML = `Added ${file.path} as ${file.hash} ` + '<br>'
          // Trigger paratii transcoder signal

          let msg = paratiiIPFS.protocol.createCommand('transcode', {hash: file.hash, author: paratiiIPFS.id.id})
          window.ipfs.swarm.connect('/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW', (err, success) => {
          // window.ipfs.swarm.connect('/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS', (err, success) => {
            if (err) throw err
            window.ipfs.swarm.peers((err, peers) => {
              console.log('peers: ', peers)
              if (err) throw err
              peers.map((peer) => {
                console.log('sending transcode msg to ', peer.peer.id.toB58String())
                paratiiIPFS.protocol.network.sendMessage(peer.peer.id, msg, (err) => {
                  if (err) console.warn('[Paratii-protocol] Error ', err)
                })

                if (peer.addr) {
                }
              })
              cb(null, file)
            })
          })
        }))),
      pull.collect((err, files) => {
        if (err) {
          throw err
        }
        if (files && files.length) {
          statusEl.innerHTML += `All Done!\n`
          statusEl.innerHTML += `Don't Close this window. signaling transcoder...\n<br>`
        }
      })
    )

    // paratii transcoder signal.
    paratiiIPFS.protocol.notifications.on('command', (peerId, command) => {
      console.log('paratii protocol: Got Command ', command)
      if (command.payload.toString() === 'transcoding:done') {
        let args = JSON.parse(command.args.toString())
        let result = JSON.parse(args.result)
        console.log('args: ', args)
        console.log('result: ', result)
        statusEl.innerHTML += `Video HLS link: /ipfs/${result.master.hash}\n`
        formContainer = document.querySelector('.upload-form')

        renderForm(formContainer, result)
      }
    })
  })
}
