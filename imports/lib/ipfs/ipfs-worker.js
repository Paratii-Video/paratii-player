'use strict'

module.exports = function (self) {
  // const SECIO = require('libp2p-secio')
  // const SECIO = self.importScripts('../../../../node_modules/libp2p-secio/src/index.js')
  // This code is required if you wanna use jquery in a web worker
  // Thanks to https://stackoverflow.com/a/43178720/2159869
  // var document = self.document = { parentNode: null, nodeType: 9, toString: function () { return "FakeDocument" } };
  // var window = self.window = self;
  // var fakeElement = Object.create(document);
  // fakeElement.nodeType = 1;
  // fakeElement.toString = function () { return "FakeElement" };
  // fakeElement.parentNode = fakeElement.firstChild = fakeElement.lastChild = fakeElement;
  // fakeElement.ownerDocument = document;
  //
  // document.head = document.body = fakeElement;
  // document.ownerDocument = document.documentElement = document;
  // document.getElementById = document.createElement = function () { return fakeElement; };
  // document.createDocumentFragment = function () { return this; };
  // document.getElementsByTagName = document.getElementsByClassName = function () { return [fakeElement]; };
  // document.getAttribute = document.setAttribute = document.removeChild =
  //     document.addEventListener = document.removeEventListener =
  //     function () { return null; };
  // document.cloneNode = document.appendChild = function () { return this; };
  // document.appendChild = function (child) { return child; };
  // document.childNodes = [];
  // document.implementation = {
  //     createHTMLDocument: function () { return document; }
  // }

  // importing Jquery
  // self.importScripts('https://code.jquery.com/jquery-3.2.1.min.js')
  // console.log('$: ', $)

  self.importScripts('https://unpkg.com/ipfs@0.25.2/dist/index.js')

  console.log('ipfs: ', self.Ipfs)

  self.postMessage('Got ipfs ' + self.Ipfs)

  if (!self.Ipfs) {
    throw new Error('self.Ipfs is undefined')
  }

  var node = new self.Ipfs({
    repo: String(Math.random()),
    start: true,
    config: {
      Addresses: {
        Swarm: [
          // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss',
          // run our own star-signal server.
          // https://github.com/libp2p/js-libp2p-webrtc-star
          // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss'
        ]
      },
      Bootstrap: [
        // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
        // https://github.com/ipfs/js-ipfs/issues/941
        // '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
        // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
        // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
        '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H'
        // official nodes that are stable.
        // '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
        // '/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
        // '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
        // '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
        // '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
      ]
    }
    // libp2p: {
    //   modules: {
    //     // transport: [new WS(), wstar]
    //     connection: {
    //       crypto: [SECIO]
    //     }
    //   }
    // }
  })

  node.on('start', () => {
    console.log('node is starting..')
  })
  node.on('ready', () => {
    console.log('worker node is ready')
    self.postMessage({ready: true}) // 'node ready')
  })

  self.onmessage = function (event) {
    console.log('worker: ', event)
    // example cmd structure
    // {
    //   cmd: 'cat',
    //   args: ['validIpfsHash or path'],
    //   callback: 'callBackId to postMessage to'
    // }
    if (event && event.data && event.data.cmd) {
      switch (event.data.cmd) {
        case 'cat':
          node.files.cat(event.data.args[0]).then((stream) => {
            stream.on('data', (chunk) => {
              self.postMessage({
                callback: event.data.callback,
                payload: chunk
              })
            })
          }).catch((err) => {
            if (err) throw err
          })
          break
        case 'add':
          // TODO run ipfs add
          node.files.add([{
            path: event.data.args.name,
            content: new node.types.Buffer(event.data.args.buffer)
          }]).then((files) => {
            // file is added to IPFS
            // TODO
            // - cat the file from a peer we control to make sure it's available if the
            // user closes the browser tab.
            // - add the hash to a localStorage list.
            console.log('added file ', files)
            self.postMessage({
              callback: event.data.callback,
              payload: files
            })
          }).catch((err) => {
            if (err) throw err
          })
          break
        case 'get':
          break
        default:
          console.error('Worker Error: Command Not found cmd: ', event.data.cmd)
      }
    }
  }
}

// in the main thread. use this
// const InlineWorker = require('inline-worker')
// const IPFSWorker = require('/imports/lib/ipfs/ipfs-worker.js')
// const ipfsWorker = new InlineWorker(IPFSWorker)
// ipfsWorker.onmessage = function (ev) {
//   console.log('got msg from worker: ', ev)
//   if (ev.data && ev.data.ready) {
//     ipfsWorker.postMessage({
//       cmd: 'cat',
//       args: ['/ipfs/QmR6QvFUBhHQ288VmpHQboqzLmDrrC2fcTUyT4hSMCwFyj'],
//       callback: 'cb-handler'
//     })
//   }
//
//   if (ev.data && ev.data.callback) {
//     console.log('Got callback\n', ev.data.payload)
//   }
// }
// ipfsWorker.postMessage('playlists')
//
