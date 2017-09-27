/* global localStorage */

export function login (browser) {
  browser.url('http://localhost:3000/profile')
  browser.waitForExist('[name="at-field-email"]', 2000)
  browser.setValue('[name="at-field-email"]', 'guildenstern@rosencrantz.com')
  browser.setValue('[name="at-field-password"]', 'password')
  browser.click('#at-btn')
}

export function getSomeETH (amount) {
  const wallet = require('./imports/lib/ethereum/wallet.js')
  const accounts = web3.eth.accounts
  console.log('send transaction')
  wallet.sendUnSignedTransaction(accounts[0], amount)
}

export function getSomePTI (amount) {
  const wallet = require('./imports/lib/ethereum/wallet.js')
  const accounts = web3.eth.accounts
  wallet.sendUnSignedContractTransaction(accounts[0], amount)
}

export function resetDb () {
  Meteor.users.remove({ 'profile.name': 'Guildenstern' })
  Meteor.users.remove({ 'emails.address': 'guildenstern@rosencrantz.com' })
  const { Videos } = require('/imports/api/videos')
  Videos.remove({'_id': '12345'})
  Videos.remove({'_id': '23456'})
  const { Playlists } = require('/imports/api/playlists')
  Playlists.remove({'_id': '98765'})
  const { Transactions } = require('/imports/api/transactions')
  Transactions.remove({'_id': '5000'})
  Transactions.remove({})
}

export function createUser () {
  Accounts.createUser({
    email: 'guildenstern@rosencrantz.com',
    password: 'password'
  })
}

export function createKeystore () {
  const wallet = require('./imports/lib/ethereum/wallet.js')
  wallet.createKeystore('password', null, function () {
    // remove the seed from the Session to simulate the situation
    // where the user has seen and dismissed the dialog
    Session.set('seed', null)
  })
}

export function createUserAndLogin (browser) {
  server.execute(createUser)
  // now log in
  login(browser)
  browser.execute(createKeystore)
}

export function clearLocalStorage () {
  localStorage.removeItem(`keystore-${Accounts.userId()}`)
}

export function createVideo (id, title, price) {
  const video = {
    id: id,
    title: title,
    price: price,
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

export function deployTestContracts () {
  console.log('deploying contracts...')

  // const wallet = require('./imports/lib/ethereum/wallet.js')
  // let ParatiiRegistry = require('./imports/lib/ethereum/contracts/ParatiiRegistry.json')
  // console.log(ParatiiRegistry)
  // owner = web3.eth.accounts[0]
  // const ParatiiRegistryContract = web3.eth.contract(ParatiiRegistry.abi)
  // let paratiiRegistryContract = await ParatiiRegistryContract.new({
  //   from: add0x(owner),
  //   data: ParatiiRegistry.unlinked_binary
  // })
  // console.log('deployed..')
  // console.log(paratiiRegistryContract)
  // return
  // const MyContract = web3.eth.contract(ParatiiToken.abi)
  // MyContract.new(
  //   {
  //     from: add0x(owner),
  //     data: ParatiiToken.unlinked_binary,
  //     gas: web3.toHex(GAS_LIMIT)
  //   }, function (err, myContract) {
  //   if (!err) {
  //      // NOTE: The callback will fire twice!
  //      // Once the contract has the transactionHash property set and once its deployed on an address.
  //
  //      // e.g. check tx hash on the first call (transaction send)
  //     if (!myContract.address) {
  //
  //      // check address on the second call (contract deployed)
  //     } else {
  //       setContractAddress(myContract.address)
  //       Meteor.call('resetFilter', {
  //         contract: myContract.address
  //       })
  //     }
  //
  //      // Note that the returned "myContractReturned" === "myContract",
  //      // so the returned "myContractReturned" object will also get the address set.
  //   }
  // })
}

// export function deployContracts () {
//   const wallet = require('./imports/lib/ethereum/wallet.js')
//   const accounts = web3.eth.accounts
//   deployTestContract(accounts[0])
// }

export function mustBeTestChain () {
  let host = server.execute(function () { return web3.currentProvider.host })
  let localNodes = 'http://localhost:8545'
  if (host !== localNodes) {
    let msg = `These tests can only be run on a local test node (e.g. ${localNodes})- your app is using ${host} instead.`
    throw Error(msg)
  }
}

export function setRegistryAddress (browser, address) {
  console.log('setting registry address to', address)
  browser.execute(function (address) {
    const contracts = require('./imports/lib/ethereum/contracts.js')
    contracts.setRegistryAddress(address)
    Meteor.settings.public.ParatiiRegistry = address
  }, address)
}
