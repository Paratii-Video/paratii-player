/* globals Ipfs */
'use strict'
import { Meteor } from 'meteor/meteor'

const SECIO = require('libp2p-secio')
/**
 * initIPFS - initiates Ipfs instance
 *
 * @param  {function} callback triggered when Ipfs node is ready
 */
function initIPFS (callback) {
  if (window.ipfs && window.ipfs.files) {
    callback()
  } else {
    // no cache busting because unpkg is complaining
    $.ajaxSetup({
      cache: true
    })
    // $.getScript('https://unpkg.com/ipfs@0.25.4/dist/index.js', () => {
    $.getScript('/test/files/index.js', () => {
    // $.getScript('./ipfs0.25.1.js', () => {
      // console.log('Ipfs: ', Ipfs)
      // const wstar = new WebRTCStar()
      console.log('SECIO TEST : ', SECIO.modified)
      let isProduction = Meteor.settings.isProduction
      console.log('isProduction:', isProduction)
      if (isProduction) {
        window.ipfs = new Ipfs({
          repo: 'paratii-alpha',
          config: {
            Addresses: {
              Swarm: [
                '/dns4/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss',
                // run our own star-signal server.
                // https://github.com/libp2p/js-libp2p-webrtc-star
                '/dns4/libp2p-webrtc-star/ip4/34.213.133.148/tcp/42000/wss'
              ]
            },
            Bootstrap: [
              // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
              // https://github.com/ipfs/js-ipfs/issues/941
              // '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
              // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
              // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
              '/ip4/34.213.133.148/tcp/4003/ws/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW',
              '/dns4/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
              '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H'
              // official nodes that are stable.
              // '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
              // '/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
              // '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
              // '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu'
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
        })
      } else {
        window.ipfs = new Ipfs({
          repo: String(Math.random()),
          config: {
            Addresses: {
              Swarm: [
                '/dns4/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss',
                // run our own star-signal server.
                // https://github.com/libp2p/js-libp2p-webrtc-star
                '/dns4/libp2p-webrtc-star/ip4/34.213.133.148/tcp/42000/wss'
              ]
            },
            Bootstrap: [
              // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
              // https://github.com/ipfs/js-ipfs/issues/941
              // '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
              // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
              // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
              '/ip4/34.213.133.148/tcp/4003/ws/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW',
              '/dns4/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
              '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H'
              // official nodes that are stable.
              // '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
              // '/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
              // '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
              // '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu'
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
        })
      }

      window.ipfs.on('ready', () => {
        console.log('[IPFS] node Ready.')
        console.log('[IPFS] _libp2pModules: ', window.ipfs._libp2pModules)
        window.ipfs.id().then((id) => {
          let peerInfo = id
          console.log('[IPFS] id: ', peerInfo)
          callback()
        })
      })

      window.ipfs.on('error', (err) => {
        if (err) {
          console.log('IPFS node ', window.ipfs)
          console.error('[IPFS] ', err)
          // throw err
        }
      })
    })
  }
}

module.exports = { initIPFS }
