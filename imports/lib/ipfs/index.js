/* globals Ipfs */
'use strict'
import { Meteor } from 'meteor/meteor'
import { getUserPTIAddress } from '/imports/api/users.js'
import { setImmediate } from 'lodash'
import Protocol from 'paratii-protocol'
// import { ParatiiIPFS } from 'paratii-lib'

const REPO_PATH = 'paratii-ipfs-repo'
function noop () {}

const paratiiIPFS = {
  protocol: null,
  onReadyHook: [],
  /**
  * initIPFS - initiates Ipfs instance
  *
  * @param  {function} callback triggered when Ipfs node is ready
  */
  initIPFS: (callback) => {
    if (window.ipfs && window.ipfs.isOnline()) {
      callback()
    } else {
      paratiiIPFS.start(callback)
    }
  },
  triggerOnReady: () => {
    // FIXME THSI IS DEV only
    // trigger functions once IPFS is ready.
    console.info('onReady Trigger')
    paratiiIPFS.onReadyHook.forEach((func) => {
      // VALIDATION IS REQUIRED HERE>>>>>>>>>>>>
      console.info('Triggering ', func)
      func()
    })
  },
  addOnReady: (func) => {
    paratiiIPFS.onReadyHook.push(func)
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

  /**
   * get Cached Ledger book for peer.
   * @param  {string}   peerId   peer B58String
   * @param  {Function} callback returns (err, ledger)
   */
  getTransactions: (peerId, callback) => {
    return callback(null, window.ipfs._bitswap.engine._findOrCreate(peerId))
    // paratiiIPFS.updateTransactions((err, updated) => {
    //   if (err) throw err
    //
    //   let localLedger = window.localStorage.getItem('paratii-ledger')
    //   if (!localLedger) {
    //     localLedger = {}
    //   } else {
    //     localLedger = JSON.parse(localLedger)
    //   }
    //
    //   if (localLedger[peerId]) {
    //     return callback(null, localLedger[peerId])
    //   } else {
    //     console.log(`${peerId} isn't in the Ledger`)
    //     return callback(new Error(`${peerId} is not in the Ledger`))
    //   }
    // })
  },

  /**
  * Clear transactions Cache
  * @param  {Function} callback callback when done
  */
  clearTransactionsCache: (callback) => {
    window.localStorage.removeItem('paratii-ledger', null)
    setImmediate(callback)
  },

  /**
 * the meteroController handles whether a peer should get the block or not.
 * @param  {Peer}   peer     IPFS Peer Object
 * @param  {uint}   size     total size of the block(s)
 * @param  {Function} callback returns (err, proceed)
 */
  meterController: (peer, size, callback) => {
    if (!callback) {
      throw new Error('meteroController Requires a callback & size')
    }

    if (size && parseInt(size) < 0) {
      throw new Error('meterController size Must be positive')
    }

    let CREDIT_PER_PEER = 5529887 / 2
    paratiiIPFS.getTransactions(peer, (err, ledger) => {
      if (err) throw err
      // if (!ledger || !ledger.accounting) {
      //   console.log('new User. sending block ', peer.toB58String(), size)
      //   ledger = ledger || {}
      //   ledger.accounting = ledger.accounting || {}
      //   ledger.accounting.bytesSent = ledger.accounting.bytesSent || 0
      //   ledger.accounting.bytesSent = ledger.accounting.bytesSent + size
      //   window.ipfs._bitswap.engine.ledgerMap.set(peer.toB58String(), ledger)
      //
      //   return callback(null, true)
      // }

      if (ledger.accounting.bytesSent + size <= CREDIT_PER_PEER) {
        console.log('bytesSent <= CREDIT', ledger.accounting.bytesSent, CREDIT_PER_PEER)
        return callback(null, true)
      } else {
        console.log('bytesSent > CREDIT', ledger.accounting.bytesSent, CREDIT_PER_PEER)
        return callback(null, false)
      }
    })
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
      bitswap: {
        maxMessageSize: 32 * 1024
        // meterController: paratiiIPFS.meterController
      },
      repo: repo,
      config: {
        Addresses: {
          Swarm: [
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
          '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
          // '/dns4/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
          // '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H'
          // official nodes that are stable.
          // '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
          // '/dns4/sfo-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
          // '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
          // '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
          // '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
        ]
      }
    })
  } else {
    window.ipfs = new Ipfs({
      bitswap: {
        maxMessageSize: 128 * 1024
        // meterController: paratiiIPFS.meterController
      },
      repo: String(Math.random()),
      config: {
        Addresses: {
          Swarm: [
            // '/ip4/127.0.0.1/tcp/9090/wss/p2p-websocket-star/',
            // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
            // run our own star-signal server.
            // https://github.com/libp2p/js-libp2p-webrtc-star
            // '/ip4/34.213.133.148/tcp/42000/wss/p2p-webrtc-star'
            // '/dns4/star.paratii.video/wss/p2p-webrtc-star',
            '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star'
            // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            // '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star'
          ]
        },
        Bootstrap: [
          // don't use official Bootstrap nodes cuz they keep f@#king thowing 403 errors
          // https://github.com/ipfs/js-ipfs/issues/941
          // '/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'
          // '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
          // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
          // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
          // '/ip4/34.213.133.148/tcp/4003/ws/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW',
          '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
          // '/dns4/star-signal.cloud.ipfs.team/wss/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
          // '/ip4/212.71.247.117/tcp/4003/ws/ipfs/QmehDvwCWhcHSvFWKit59Liuxxu28N17Rm5pdpPN6uFC5H',
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
    // callback()
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
      paratiiIPFS.id = id
      console.log('[IPFS] id: ', peerInfo)
      let ptiAddress = getUserPTIAddress() || 'no_address'
      paratiiIPFS.protocol = new Protocol(
        window.ipfs._libp2pNode,
        window.ipfs._repo.blocks,
        // add ETH Address here.
        ptiAddress
      )

      paratiiIPFS.protocol.notifications.on('message:new', (peerId, msg) => {
        console.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
      })

      setTimeout(() => {
        paratiiIPFS.protocol.start(noop)
        paratiiIPFS.triggerOnReady()
      }, 10)

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

module.exports = paratiiIPFS
