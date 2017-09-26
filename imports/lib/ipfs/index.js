/* globals Ipfs */
'use strict'
import { Meteor } from 'meteor/meteor'
import { getUserPTIAddress } from '/imports/api/users.js'
import Protocol from 'paratii-protocol'

const REPO_PATH = 'paratii-ipfs-repo'
function noop () {}

const paratiiIPFS = {
  protocol: null,
  /**
  * initIPFS - initiates Ipfs instance
  *
  * @param  {function} callback triggered when Ipfs node is ready
  */
  initIPFS: (callback) => {
    if (window.ipfs && window.ipfs.isOnline()) {
      callback()
    } else {
      // no cache busting because unpkg is complaining
      // $.ajaxSetup({
      //   cache: true
      // })
      // $.getScript('https://unpkg.com/ipfs@0.25.4/dist/index.js', () => {
      $.getScript('/test/files/index.js', () => {
        let isProduction = Meteor.settings.isProduction
        let repo = paratiiIPFS.getRepoPath()
        if (!repo) {
          repo = paratiiIPFS.setRepoPath('paratii-alpha-' + String(Math.random()))
        }
        console.log('isProduction:', isProduction)
        if (isProduction) {
          // production settings.
          window.ipfs = new Ipfs({
            repo: repo,
            config: {
              Addresses: {
                Swarm: [
                  '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                  // run our own star-signal server.
                  // https://github.com/libp2p/js-libp2p-webrtc-star
                  // '/ip4/34.213.133.148/tcp/42000/wss/p2p-webrtc-star'
                  '/dns4/star.paratii.video/wss/p2p-webrtc-star'
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
            }
          })
        } else {
          window.ipfs = new Ipfs({
            repo: String(Math.random()),
            config: {
              Addresses: {
                Swarm: [
                  // '/ip4/127.0.0.1/tcp/9090/wss/p2p-websocket-star/',
                  // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                  // run our own star-signal server.
                  // https://github.com/libp2p/js-libp2p-webrtc-star
                  // '/ip4/34.213.133.148/tcp/42000/wss/p2p-webrtc-star'
                  '/dns4/star.paratii.video/wss/p2p-webrtc-star'
                ]
              },
              Bootstrap: [
                // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
                // https://github.com/ipfs/js-ipfs/issues/941
                // '/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
                // '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
                // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
                // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
                '/ip4/34.213.133.148/tcp/4003/ws/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW',
                '/dns4/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
                '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H'
                // '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
                // '/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
                // '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
                // '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
                // '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
              ]
            }
          })
        }

        window.ipfs.on('ready', () => {
          console.log('[IPFS] node Ready.')

          window.ipfs._bitswap.notifications.on('receivedNewBlock', (peerId, block) => {
            console.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length)
            console.log('---------[IPFS] bitswap LedgerMap ---------------------')
            window.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
              console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
            })
            console.log('-------------------------------------------------------')
          })

          window.ipfs.id().then((id) => {
            let peerInfo = id
            console.log('[IPFS] id: ', peerInfo)
            let ptiAddress = getUserPTIAddress() || 'no_address'
            paratiiIPFS.protocol = new Protocol(
              window.ipfs._libp2pNode,
              window.ipfs._repo.blocks,
              // add ETH Address here.
              ptiAddress
            )

            paratiiIPFS.protocol.start(callback)

            // callback()
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
  },
  getRepoPath: () => {
    if (window.localStorage) {
      return window.localStorage.getItem(REPO_PATH)
    } else {
      throw new Error('window.localStorage is not available')
    }
  },
  setRepoPath: (path) => {
    if (window.localStorage) {
      window.localStorage.setItem(REPO_PATH, path)
      return paratiiIPFS.getRepoPath()
    } else {
      throw new Error('window.localStorage is not available')
    }
  },

  clearRepo: (callback) => {
    paratiiIPFS.setRepoPath('paratii-ipfs-repo' + String(Math.random()))
    paratiiIPFS.restart(callback)
  },

  restart: (callback) => {
    if (!paratiiIPFS.isOnline()) {
      return paratiiIPFS.initIPFS(callback)
    }

    paratiiIPFS.stop((err) => {
      if (err) throw err
      return paratiiIPFS.initIPFS(callback)
    })
  },
  isOnline: () => {
    if (!window.ipfs) {
      return false
    }
    return window.ipfs.isOnline()
  },

  // transactions
  updateTransactions: (callback) => {
    // adds up or create data transactions in localStorage
    // TODO : store this somewhere safe or in a verifiable way.
    // if (!ledger || typeof ledger === 'function') {
    //   return callback(new Error('ledger is required to update transactions.'))
    // }

    if (!callback || typeof callback !== 'function') {
      callback = noop
    }

    let localLedger = window.localStorage.getItem('paratii-ledger')
    if (!localLedger) {
      localLedger = {}
    } else {
      localLedger = JSON.parse(localLedger)
    }
    // TODO to be continued
    if (!paratiiIPFS.isOnline()) {
      window.localStorage.setItem('paratii-ledger', JSON.stringify(localLedger))
      return callback(new Error('Node is offline.'))
    }

    window.ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
      console.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
      localLedger[peerId] = localLedger[peerId] || {
        bytesSent: 0,
        bytesRecv: 0
      }

      localLedger[peerId].bytesSent += ledger.accounting.bytesSent
      localLedger[peerId].bytesRecv += ledger.accounting.bytesRecv

      ledger.accounting.bytesSent = 0
      ledger.accounting.bytesRecv = 0

      window.ipfs._bitswap.engine.ledgerMap.set(peerId, ledger)
    })

    window.localStorage.setItem('paratii-ledger', JSON.stringify(localLedger))
    callback(null, 1)
  },
  start: (callback) => {
    if (!window.Ipfs) {
      return callback(new Error('window.Ipfs is not available, call initIPFS first'))
    }

    if (window.ipfs && window.ipfs.isOnline()) {
      return callback()
    }

    window.ipfs.start(callback)
  },
  stop: (callback) => {
    if (!window.ipfs || !window.ipfs.isOnline()) {
      return callback()
    }

    window.ipfs.stop(callback)
  }
}

module.exports = paratiiIPFS
