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
  const { Playlists } = require('/imports/api/playlists')
  Playlists.remove({'_id': '98765'})
  const { Transactions } = require('/imports/api/transactions')
  Transactions.remove({'_id': '5000'})
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
