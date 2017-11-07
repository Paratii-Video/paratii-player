/* global localStorage */
import { web3 } from '../imports/lib/ethereum/web3.js'
import { getParatiiContracts } from '../imports/lib/ethereum/contracts.js'
import { deployParatiiContracts } from '../imports/lib/ethereum/helpers.js'
import { assert } from 'chai'

web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'))
export { web3 }

export const SEED = 'road inherit leave arm unlock estate option merge mechanic rate blade dumb'
export const USERADDRESS = '0xdef933d2d0203821af2a1579d77fb42b4f8dcf7b'

export function getProvider () {
  return Meteor.settings.public.http_provider
}

export function login (browser) {
  browser.execute(function () {
    Meteor.loginWithPassword('guildenstern@rosencrantz.com', 'password')
  })
}

export function logout (browser) {
  browser.execute(function () {
    Meteor.logout()
  })
}

export function createUserAndLogin (browser) {
  let userId = server.execute(createUser)
  browser.execute(createKeystore, null, userId)
  login(browser)
  // the login handler will open a modal window (because a keystore is not available yet), which we need to close
  // browser.execute(function () { Modal.hide() })
}

export function assertUserIsLoggedIn (browser) {
  // assert that the user is logged in
  let userId = browser.execute(function () {
    return Meteor.userId()
  }).value
  assert.isOk(userId)
}

export function assertUserIsNotLoggedIn (browser) {
  // assert that the user is logged in
  let userId = browser.execute(function () {
    return Meteor.userId()
  }).value
  assert.isNotOk(userId)
}

export function getSomeETH (amount) {
  const helpers = require('./imports/lib/ethereum/helpers.js')
  const users = require('./imports/api/users.js')
  let beneficiary = users.getUserPTIAddress()
  helpers.sendSomeETH(beneficiary, amount)
}

export function getSomePTI (amount) {
  const helpers = require('./imports/lib/ethereum/helpers.js')
  const users = require('./imports/api/users.js')
  let beneficiary = users.getUserPTIAddress()
  helpers.sendSomePTI(beneficiary, amount)
}

export function getUserPTIAddressFromBrowser () {
  return browser.execute(function () {
    const users = require('./imports/api/users.js')
    let address = users.getUserPTIAddress()
    return address
  }).value
}

export function getAnonymousAddress () {
  return browser.execute(function () {
    const wallet = require('./imports/lib/ethereum/wallet.js')
    const keystore = wallet.getKeystore('anonymous')
    return keystore.getAddresses()[0]
  }).value
}

export function createAnonymousAddress () {
  return browser.execute(function () {
    const wallet = require('./imports/lib/ethereum/wallet.js')
    wallet.createAnonymousKeystoreIfNotExists()
  }).value
}

export function getRegistryAddressFromBrowser () {
  return browser.executeAsync(async function (done) {
    const contracts = require('./imports/lib/ethereum/contracts.js')
    return done(await contracts.getRegistryAddress())
  })
}

export function resetDb () {
  Meteor.users.remove({ 'profile.name': 'Guildenstern' })
  Meteor.users.remove({ 'emails.address': 'guildenstern@rosencrantz.com' })
  const { Videos } = require('/imports/api/videos')
  Videos.remove({'_id': '12345'})
  Videos.remove({'_id': '12346'})
  Videos.remove({'_id': '12347'})
  Videos.remove({'_id': '12348'})
  Videos.remove({'_id': '23456'})
  const { Playlists } = require('/imports/api/playlists')
  Playlists.remove({'_id': '98765'})
  const { Transactions } = require('/imports/api/transactions')
  Transactions.remove({'_id': '5000'})
  Transactions.remove({})
}

export async function getOrDeployParatiiContracts (server, browser) {
  let contracts
  let paratiiRegistryAddress = await server.execute(function () {
    return Meteor.settings.public.ParatiiRegistry
  })
  if (paratiiRegistryAddress) {
    setRegistryAddress(browser, paratiiRegistryAddress)
    contracts = await getParatiiContracts(paratiiRegistryAddress)
  } else {
    contracts = await deployParatiiContracts()
    setRegistryAddress(browser, contracts['ParatiiRegistry'].address)
  }
  return contracts
}

export function createUser () {
  return Accounts.createUser({
    email: 'guildenstern@rosencrantz.com',
    password: 'password'
  })
}

export function createKeystore (seed, userId) {
  const wallet = require('./imports/lib/ethereum/wallet.js')
  wallet.createKeystore('password', seed, userId, function () {
    // remove the seed from the Session to simulate the situation
    // where the user has seen and dismissed the dialog
    Session.set('seed', null)
  })
}

export function clearUserKeystoreFromLocalStorage () {
  localStorage.removeItem(`keystore-${Accounts.userId()}`)
}

export function nukeLocalStorage () {
  localStorage.clear()
}

// export function createVideo (id, title, price) {
//   const video = {
//     id: id,
//     title: title,
//     price: price,
//     src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
//     mimetype: 'video/mp4',
//     stats: {
//       likes: 150,
//       dislikes: 10
//     }
//   }
//   Meteor.call('videos.create', video)
// }

export function createVideo (id, title, description, uploaderName, tags, price) {
  const video = {
    id: id,
    title: title,
    price: price,
    description: description,
    uploader: {
      name: uploaderName
    },
    tags: tags,
    src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
    mimetype: 'video/mp4',
    stats: {
      likes: 150,
      dislikes: 10
    }
  }
  Meteor.call('videos.create', video)
}

export function createPlaylist (id, title, videos) {
  const playlist = {
    id: id,
    title: title,
    description: 'A playlist for tests!',
    url: 'test-playlist',
    videos: videos
  }
  Meteor.call('playlists.create', playlist)
}

export function mustBeTestChain () {
  let host = server.execute(function () { return web3.currentProvider.host })
  let localNodes = 'http://localhost:8545'
  if (host !== localNodes) {
    let msg = `These tests can only be run on a local test node (e.g. ${localNodes})- your app is using ${host} instead.`
    throw Error(msg)
  }
}

export function setRegistryAddress (browser, address) {
  // console.log('setting registry address to', address)
  global.Meteor = {settings: {public: {ParatiiRegistry: address}}}

  browser.execute(function (address) {
    const contracts = require('./imports/lib/ethereum/contracts.js')
    contracts.setRegistryAddress(address)
    Meteor.settings.public.ParatiiRegistry = address
  }, address)
}
