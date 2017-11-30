import { web3, logout, createUserAndLogin, getUserPTIAddressFromBrowser, nukeLocalStorage, resetDb } from './helpers.js'
import { assert } from 'chai'

describe('Video Store:', function () {
  let contracts
  let videoId = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ' // this is  a known videoId defined in fixtures.js

  before(async function (done) {
    // browser.execute(nukeLocalStorage)
    // server.execute(resetDb)
    // browser.url('http://localhost:3000')

    // contracts = await getOrDeployParatiiContracts(server, browser)
    contracts = browser.contracts
    // check sanity: the video we are testing with should have the right info
    let videoRegistry = await contracts.VideoRegistry
    let videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(Number(videoInfo[1]), web3.toWei(14))
    done()
  })

  beforeEach(function () {
    browser.execute(nukeLocalStorage)
    server.execute(resetDb)
    createUserAndLogin(browser)
  })

  afterEach(function () {
    // browser.execute(nukeLocalStorage)
    // server.execute(resetDb)
  })

  it('should be possible to buy (and unlock) a video  ', function () {
    // make sure we have enough funds
    let userAccount = getUserPTIAddressFromBrowser()
    browser.sendSomeETH(userAccount, 2.1)
    browser.sendSomePTI(userAccount, 300)

    browser.url(`http://localhost:3000/play/${videoId}`)

    browser.waitUntil(function () {
      let ethBalance = browser.execute(function () {
        return Session.get('eth_balance')
      })
      return ethBalance.value > 0
    })
    browser.waitUntil(function () {
      let ptiBalance = browser.execute(function () {
        return Session.get('pti_balance')
      })
      return ptiBalance.value > 0
    })
    browser.waitAndClick('#unlock-video')
    browser.waitAndSetValue('[name="user_password"]', 'password')
    browser.waitAndClick('#send_trans_btn')
    // TODO: check if the video has actually been acquired!
    // (for now, we just check if the balance has been lowered..)
    browser.waitUntil(function () {
      let balance = contracts.ParatiiToken.balanceOf(userAccount)
      // the price was 14 PTI, so the users balance should be equal to 300 - 14
      return Number(balance) === Number(web3.toWei(300 - 14))
    }, 10000)
    browser.url('http://localhost:3000/transactions')
    let description = 'Bought video QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    browser.waitForExist('.transaction-description')
    let msg = `Expected to find ${description} in the first from ${browser.getText('.transaction-description')}`
    assert.isOk(browser.getText('.transaction-description')[0].indexOf(description) > -1, msg)

    // the video should be unlocked now
    browser.url(`http://localhost:3000/play/${videoId}`)
    browser.waitForExist('.player-controls')
  })

  it('should show an error if the password is wrong @watch', function () {
    // make sure we have enough funds
    let userAccount = getUserPTIAddressFromBrowser()
    browser.sendSomeETH(userAccount, 2.1)
    browser.sendSomePTI(userAccount, 300)

    browser.url(`http://localhost:3000/play/${videoId}`)
    // browser.pause(2000)
    browser.waitAndClick('#unlock-video')
    browser.waitAndSetValue('[name="user_password"]', 'wrong_password')
    browser.waitAndClick('#send_trans_btn')
    const expectedErrorMessage = 'Wrong password'
    browser.waitForClickable('.main-alert-content')
    assert.equal(browser.getText('.main-alert-content'), expectedErrorMessage)
  })

  it('should show the signin form if the user is not logged in', function () {
    logout(browser)
    browser.execute(nukeLocalStorage)

    browser.url(`http://localhost:3000/play/${videoId}`)
    browser.waitAndClick('#unlock-video')
    browser.getText('h3', 'Sign in')
  })

  it('should show an error if the user does not have enough PTI ', function () {
    // make sure we have enough funds
    let userAccount = getUserPTIAddressFromBrowser()
    browser.sendSomeETH(userAccount, 2.1)

    browser.url(`http://localhost:3000/play/${videoId}`)

    browser.waitUntil(function () {
      let ethBalance = browser.execute(function () {
        return Session.get('eth_balance')
      })
      return ethBalance.value > 0
    })
    let ptiBalance = contracts.ParatiiToken.balanceOf(userAccount)
    assert.equal(ptiBalance, 0)

    browser.waitAndClick('#unlock-video')
    const expectedErrorMessage = 'You don\'t have enough PTI: your balance is 0'
    browser.waitForClickable('.main-alert-content')
    assert.equal(browser.getText('.main-alert-content'), expectedErrorMessage)
  })

  it('should show an error if the user does not have enough ETH', function () {
    let userAccount = getUserPTIAddressFromBrowser()
    browser.sendSomePTI(userAccount, 300)

    browser.url(`http://localhost:3000/play/${videoId}`)
    browser.waitUntil(function () {
      let ethBalance = browser.execute(function () {
        return Session.get('eth_balance')
      })
      return ethBalance.value === 0
    })

    browser.waitAndClick('#unlock-video')
    const expectedErrorMessage = 'You need some Ether for sending a transaction - but you have none'
    browser.waitForClickable('.main-alert-content')
    assert.equal(browser.getText('.main-alert-content'), expectedErrorMessage)
  })

  it('test individual steps', function () {
    let buyer = web3.eth.accounts[1]
    let tx
    // console.log(`transfer some PTI to ${buyer}`)
    tx = contracts.ParatiiToken.transfer(buyer, Number(web3.toWei(2000)), {from: web3.eth.accounts[0]})
    // console.log(`approve ${web3.toWei(0)} to ${contracts.ParatiiAvatar.address}`)
    tx = contracts.ParatiiToken.approve(contracts.ParatiiAvatar.address, 0, {from: buyer})
    // console.log(`approve ${web3.toWei(2000)} to ${contracts.ParatiiAvatar.address}`)
    tx = contracts.ParatiiToken.approve(contracts.ParatiiAvatar.address, Number(web3.toWei(2000)), {from: buyer})
    // console.log(tx)
    // console.log(`approve ${web3.toWei(0)} to ${web3.eth.accounts[0]}`)
    // tx = contracts.ParatiiToken.approve(web3.eth.accounts[0], 0, {from: buyer})
    // console.log(tx)
    // console.log(`approve ${web3.toWei(2000)} to ${web3.eth.accounts[0]}`)
    // tx = contracts.ParatiiToken.approve(web3.eth.accounts[0], NumgetBalanceber(web3.toWei(2000)), {from: buyer})
    // console.log(tx)
    // console.log(`ParatiiToken.transferFrom ${buyer} to ${contracts.ParatiiAvatar.address} a total of ${web3.toWei(3)}`)
    // tx = contracts.ParatiiToken.transferFrom(buyer, contracts.ParatiiAvatar.address, Number(web3.toWei(3)), {from: web3.eth.accounts[0]})
    // console.log(tx)

    // console.log('Adding to whitelist')
    tx = contracts.ParatiiAvatar.addToWhitelist(web3.eth.accounts[0], {from: web3.eth.accounts[0]})
    // console.log(tx)

    // tx = contracts.ParatiiToken.allowance(buyer, contracts.ParatiiAvatar.address, {from: web3.eth.accounts[0]})
    // console.log(`Allowance of ${contracts.ParatiiAvatar.address}: ${Number(tx)}`)
    // console.log(`ParatiiAvatar.transferFrom ${buyer} to ${contracts.ParatiiAvatar.address} a total of ${web3.toWei(3)}`)
    // tx = contracts.ParatiiAvatar.transferFrom(buyer, contracts.ParatiiAvatar.address, Number(web3.toWei(3)), {from: web3.eth.accounts[0]})
    // console.log(tx)
    // console.log(`ParatiiAvatar.transferFrom ${buyer} to owner at ${owner} a total of ${web3.toWei(3)}`)
    // tx = contracts.ParatiiAvatar.transferFrom(buyer, owner, Number(web3.toWei(3)), {from: web3.eth.accounts[0]})
    // console.log(tx)
    // tx = contracts.VideoStore.tst(videoId, {from: web3.eth.accounts[0]})
    // console.log('-------------------------------------------')
    // console.log(Number(tx))

    // console.log('check preconditions')
    // 1. paratiiRegistry from VideoStore is known
    tx = contracts.VideoStore.paratiiRegistry({from: web3.eth.accounts[0]})
    assert.equal(contracts.ParatiiRegistry.address, tx)
    // 2. VideoRegistry and ParatiiAvatar are known in the paratiiRegistry
    tx = contracts.ParatiiRegistry.getContract('ParatiiAvatar')
    assert.equal(contracts.ParatiiAvatar.address, tx)
    tx = contracts.ParatiiRegistry.getContract('VideoRegistry')
    assert.equal(contracts.VideoRegistry.address, tx)
    // 2. the price is known in the videoRegistry
    tx = contracts.VideoRegistry.getVideoInfo(videoId)
    let price = web3.toWei(14)
    assert.equal(tx[1], price)
    // 3. proper approval is given to the ParatiiAvatar
    tx = contracts.ParatiiToken.allowance(buyer, contracts.ParatiiAvatar.address, {from: web3.eth.accounts[0]})
    assert.isOk(Number(tx) > Number(price))
    // * redistributionPoolShare is defined
    tx = contracts.ParatiiRegistry.getNumber('VideoRedistributionPoolShare')
    let share = web3.toWei(0.3)
    assert.equal(Number(tx), share)
    // this means that the paratiiPart
    // console.log((price * share) / 10 ** 18)
    // console.log(tx)
    // console.log(`ParatiiAvatar.transferFrom ${buyer} to ${contracts.ParatiiAvatar.address} a total of ${web3.toWei(3)}`)
    // tx = contracts.ParatiiAvatar.transferFrom(buyer, contracts.ParatiiAvatar.address, Number(web3.toWei(3)), {from: web3.eth.accounts[0]})
    // console.log(tx)
    // console.log(`ParatiiAvatar.transferFrom ${buyer} to owner at ${owner} a total of ${web3.toWei(3)}`)
    // tx = contracts.ParatiiAvatar.transferFrom(buyer, owner, Number(web3.toWei(3)), {from: web3.eth.accounts[0]})
    // console.log(tx)
    // console.log(owner)
    // console.log('REMAINING ALLOWANCE:', Number(contracts.ParatiiToken.allowance(buyer, contracts.ParatiiAvatar.address, {from: web3.eth.accounts[0]})))
    // console.log('TO TRANSFER        :  ', Number(web3.toWei(3)))
    // console.log('PTIbalance of buyer:', Number(contracts.ParatiiToken.balanceOf(buyer)))
    // console.log('ETHbalance of buyer:', web3.eth.getBalance(buyer))
    // console.log('Now buy the video')
    tx = contracts.VideoStore.buyVideo(videoId, {from: buyer, gas: 210000, gasPrice: 20000000000})
    // console.log(tx)
    // tx = contracts.ParatiiAvatar.transferFrom(buyer, owner, Number(web3.toWei(3)), {from: web3.eth.accounts[0]})
    // console.log('x')
    // tx = contracts.ParatiiAvatar.transferFrom(buyer, owner, 9800000000000000000, {from: buyer})
    // console.log(tx)
    // tx = contracts.ParatiiToken.allowance(buyer, contracts.ParatiiAvatar.address, {from: web3.eth.accounts[0]})
    // console.log(tx)
    // console.log('REMAINING ALLOWANCE:', Number(tx))
    // console.log('TO TRANSFER        :', 980000000000000000)
    // tx = contracts.VideoStore.tst2(contracts.ParatiiAvatar.address, 980000000000000000, {from: buyer})
    // console.log(tx)
    // console.log('REMAINING ALLOWANCE:', Number(contracts.ParatiiToken.allowance(buyer, contracts.ParatiiAvatar.address, {from: web3.eth.accounts[0]})))
    // console.log('TO TRANSFER        :', Number(price))
    // console.log('PTIbalance of buyer:', Number(contracts.ParatiiToken.balanceOf(buyer)))
    // console.log('ETHbalance of buyer:', web3.eth.getBalance(buyer))
  })
})
