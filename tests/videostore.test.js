import { web3, resetDb, createUserAndLogin, getSomeETH, getSomePTI, getUserPTIAddressFromBrowser, setRegistryAddress } from './helpers.js'
import { deployParatiiContracts } from '../imports/lib/ethereum/helpers.js'
import { getParatiiContracts } from '../imports/lib/ethereum/contracts.js'
import { assert } from 'chai'

describe('Video Store: ', function () {
  let contracts
  let videoId = '5' // this is  a known videoId defined in fixtures.js

  before(async function (done) {
    browser.url('http://127.0.0.1:3000')

    let paratiiRegistryAddress = await server.execute(function () {
      return Meteor.settings.public.ParatiiRegistry
    })
    if (paratiiRegistryAddress) {
      console.log('registry already known, reading contact addresses')
      setRegistryAddress(browser, paratiiRegistryAddress)
      contracts = await getParatiiContracts(paratiiRegistryAddress)
    } else {
      contracts = await deployParatiiContracts()
      setRegistryAddress(browser, contracts['ParatiiRegistry'].address)
    }

    // check sanity: the video we are testing with should have the right info
    // let videoRegistry = await contracts['VideoRegistry']
    // let videoInfo = await videoRegistry.getVideoInfo(videoId)
    // // console.log('VideoInfo from registry:', videoInfo)
    // assert.equal(videoInfo[0], owner)
    // assert.equal(Number(videoInfo[1]), web3.toWei(14))
    // also the `VideoRedistributionPoolShare` should be set to some reasonable number
    // let share = await contracts.ParatiiRegistry.getNumber('VideoRedistributionPoolShare')
    // assert.equal(share, web3.toWei(0.3))
    // console.log(Number(share / (10 ** 18)))
    // check if the VideoStore is whitelisted
    // let isOnWhiteList = await contracts.ParatiiAvatar.isOnWhiteList(contracts.VideoStore.address)
    // assert.equal(isOnWhiteList, true)
    // console.log(web3.eth.defaultAccount)
    done()
  })

  beforeEach(function () {
    server.execute(resetDb)
    createUserAndLogin(browser)
    let userAccount = getUserPTIAddressFromBrowser()
    console.log(userAccount)
    browser.execute(getSomeETH, 2.1)
    browser.waitForExist('#eth_amount', 5000)
    browser.execute(getSomePTI, 300)

    browser.click('a[href="#pti"]')
    browser.waitForExist('#pti_amount', 5000)
    const amount = browser.getHTML('#pti_amount', false)
    assert.equal(amount, 300)
  })

  it('test individual steps', function (done) {
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

    console.log('check preconditions')
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
    done()
  })
  it('should be possible to buy (and unlock) a video [TODO] @watch', function (done) {
    // check sanity
    // set up the test..
    browser.url(`http://localhost:3000/play/${videoId}`)
    browser.waitForEnabled('#unlock-video', 5000)
    browser.click('#unlock-video')
    browser.waitForEnabled('[name="user_password"]')
    browser.pause(1000)
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#send_trans_btn')
    // TODO: check if the video has actually been acquired!
    // (for now, we just check if the balance has been lowered..)
    let userAccount = getUserPTIAddressFromBrowser()
    browser.waitUntil(function () {
      let balance = contracts.ParatiiToken.balanceOf(userAccount)
      // the price was 14 PTI, so the users balance should be equal to 300 - 14
      return Number(balance) === Number(web3.toWei(300 - 14))
    }, 10000)
    done()
  })

  // TODO:  test for error handling:
  // 1. if not enough ETH to send transation
  // 2. if not engouh PTI to send transaction
  //
})
