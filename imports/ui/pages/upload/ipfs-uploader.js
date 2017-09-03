'use strict';
import streamBuffers from 'stream-buffers';
import { initIPFS } from '../../../lib/ipfs/index.js';
var dropAreaEl, statusEl;

document.addEventListener('DOMContentLoaded', (e) => {
  console.log('DOMContentLoaded', document);
  dropAreaEl = document.querySelector('body');

  dropAreaEl.addEventListener('dragover', dragenter);
  dropAreaEl.addEventListener('dragenter', dragenter);
  dropAreaEl.addEventListener('drop', drop);
  // var storageQuota = window.StorageQuota
  // storageQuota.requestPersistentQuota(100 * 1024 * 1024).then((storageInfo) => {
  //   console.log('got storageInfo ', storageInfo)
  // })
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
      if (granted) {
        console.log('Storage will not be cleared except by explicit user action');
      } else {
        console.log('Storage may be cleared by the UA under storage pressure.');
      }
    });
  }
});

function dragenter (ev) {
  statusEl = document.querySelector('.statusContainer');

  ev.stopPropagation();
  ev.preventDefault();
  console.log('dragenter', ev);
}

function drop (ev) {
  console.log('drop', ev);
  const dt = ev.dataTransfer;
  const files = dt.files;

  let file;

  if (!ev) {
    file = files[0];
  } else {
    dragenter(ev);
    file = ev.dataTransfer.files[0];
  }

  if (file) {
    // parse it,  send it to IPFS
    console.log('file ', file);
    statusEl.innerHTML = 'adding '+ file.name+' to IPFS';

    addToIPFS(file);
  }
}


function addToIPFS (file) {

  function readFileContents (file) {
    return new Promise((resolve) => {
      const reader = new window.FileReader();
      reader.onload = (event) => {
        console.log('reader onload ', event);
        resolve(event.target.result);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // const InlineWorker = require('inline-worker')
  // const IPFSWorker = require('/imports/lib/ipfs/ipfs-worker.js')
  // const ipfsWorker = new InlineWorker(IPFSWorker)
  // ipfsWorker.onmessage = function (ev) {
  //   console.log('got msg from worker: ', ev)
  //   if (ev.data && ev.data.ready) {
  //     readFileContents(file).then((buf) => {
  //       ipfsWorker.postMessage({
  //         cmd: 'add',
  //         args: {
  //           name: file.name,
  //           buffer: buf
  //         },
  //         callback: 'cb-handler'
  //       })
  //     })
  //   }
  //
  //   if (ev.data && ev.data.callback) {
  //     console.log('Got callback\n', ev.data.payload)
  //     statusEl.innerHTML = 'DONE! file ' + ev.data.payload[0].path + ' to IPFS as ' + ev.data.payload[0].hash
  //   }
  // }
  // ipfsWorker.postMessage('playlists')
  //


  initIPFS(() => {
    console.log('[IPFS] uploader instance ready.');

    readFileContents(file).then((buf) => {
      console.log('[IPFS] add \t: file.name: ', file.name, ' contentsize: ', buf.byteLength);
      let fileSize = buf.byteLength;
      let progress = 0;

      let myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        // frequency: 10,   // in milliseconds.
        chunkSize: 32048  // in bytes.
      });

      window.ipfs.files.createAddStream((err, stream) => {
        if (err) throw err;

        stream.on('data', (file) => {
          console.log('FILE : ', file);
          statusEl.innerHTML = 'DONE! file ' + file.path + ' to IPFS as ' + file.hash;
          if(progressbar) {
            clearInterval(progressbar);
            progress = 0;
          }
        });

        myReadableStreamBuffer.on('data', (chunk) => {
          progress += chunk.byteLength;
          // console.log('got chunk size: ', chunk.byteLength, ' ', chunk)

          // stream.write({
          //   path: file.name,
          //   content: new window.ipfs.types.Buffer(chunk)
          // })


          // myReadableStreamBuffer.resume()

        });

        console.log('buf size: ', buf.byteLength);
        console.log('readable stream : ', myReadableStreamBuffer);
        console.log('readable stream destory: ', myReadableStreamBuffer.destory);
        if(!myReadableStreamBuffer.destroy) {
          console.log('adding destroy method');
          myReadableStreamBuffer.destroy = () => {
            console.log('destroy called');
          };
        }

        stream.write({
          path: file.name,
          content: myReadableStreamBuffer
        });

        myReadableStreamBuffer.put(Buffer.from(buf));
        myReadableStreamBuffer.stop();

        myReadableStreamBuffer.on('end', () => {
          console.log('stream ended.');
          stream.end();
        });

        myReadableStreamBuffer.resume();

        let progressbar  = setInterval(() => {
          console.log('progress: ', progress, '/', fileSize, ' = ', Math.floor((progress / fileSize) * 100), '%');
        }, 5000);


      });
      // TODO
      // if there is transcoding required, it should be done before adding the file.
      // window.ipfs.files.add([{
      //   path: file.name,
      //   // content: new window.ipfs.types.Buffer(buf)
      //   content: myReadableStreamBuffer
      // }]).then((files) => {
      //   // file is added to IPFS
      //   // TODO
      //   // - cat the file from a peer we control to make sure it's available if the
      //   // user closes the browser tab.
      //   // - add the hash to a localStorage list.
      //   console.log('added file ', files)
      //   statusEl.innerHTML = 'DONE! file ' + files[0].path + ' to IPFS as ' + files[0].hash
      // }).catch((err) => {
      //   if (err) throw err
      // })

    });
  });
}
