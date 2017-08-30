'use strict';
// const WebRTCStar = require('libp2p-webrtc-star')
// const WS = require('libp2p-websockets')
const SECIO = require('libp2p-secio');
/**
 * initIPFS - initiates Ipfs instance
 *
 * @param  {function} callback triggered when Ipfs node is ready
 */
function initIPFS (callback) {
  if (window.ipfs && window.ipfs.files) {
    callback();
  } else {
    // no cache busting because unpkg is complaining
    $.ajaxSetup({
      cache: true
    })
    $.getScript('https://unpkg.com/ipfs@0.25.2/dist/index.js', () => {
    // $.getScript('./ipfs0.25.1.js', () => {
      // console.log('Ipfs: ', Ipfs)
      // const wstar = new WebRTCStar()
      window.ipfs = new Ipfs({
        repo: String(Math.random()),
        config: {
          Addresses: {
            Swarm: [
              '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss',
              // run our own star-signal server.
              // https://github.com/libp2p/js-libp2p-webrtc-star
              // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss'
            ]
          },
          Bootstrap: [
            // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
            // https://github.com/ipfs/js-ipfs/issues/941
            '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
            '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
            '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
            '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
            '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
            // official nodes that are stable.
            // '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
            // '/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
            // '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
            // '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
            // '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
          ]
        },
        libp2p: {
          modules: {
            // transport: [new WS(), wstar]
            connection: {
              crypto: [SECIO]
            }
          }
        }
      });

      var peerInfo;

      window.ipfs.on('ready', () => {
        console.log('[IPFS] node Ready.');
        window.ipfs.id().then((id) => {
          peerInfo = id;
          console.log('[IPFS] id: ', id);
          callback();
        });
      });

      window.ipfs.on('error', (err) => {
        if (err) {
          console.log('IPFS node ', window.ipfs);
          console.error('[IPFS] ', err);
          throw err;
        }
      });
    });
  }
}

module.exports = { initIPFS };
