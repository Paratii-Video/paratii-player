'use strict'

module.exports = function (self) {
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

  self.postMessage('Got ipfs '+ self.Ipfs)

  self.onmessage = function (event) {
    console.log('worker: ', event)
  }
}


// in the main thread. use this
// const InlineWorker = require('inline-worker')
// const IPFSWorker = require('/imports/lib/ipfs/ipfs-worker.js')
// const ipfsWorker = new InlineWorker(IPFSWorker)
// ipfsWorker.onmessage = function (ev) {
//   console.log('got msg from worker: ', ev)
// }
// ipfsWorker.postMessage('playlists')
//
