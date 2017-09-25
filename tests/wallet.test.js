import { resetDb, mustBeTestChain, createUserAndLogin, getSomeETH, getSomePTI, setRegistryAddress } from './helpers.js'
import { web3, deployParatiiContracts } from '../imports/lib/ethereum/helpers.js'

describe('wallet', function () {
  let contractAddresses

  before(async function (done) {
    mustBeTestChain()
    browser.url('http://127.0.0.1:3000')
    let paratiiRegistryAddress
    paratiiRegistryAddress = await browser.execute(function () {
      return Meteor.settings.public.ParatiiRegistry
    })
    console.log(paratiiRegistryAddress.value)
    contractAddresses = await deployParatiiContracts()
    setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
    paratiiRegistryAddress = await browser.execute(function () {
      return Meteor.settings.public.ParatiiRegistry
    })
    console.log(paratiiRegistryAddress.value)
    done()
  })

  beforeEach(async function () {
    server.execute(resetDb)
    createUserAndLogin(browser)
  })

  afterEach(function () {

  })

  it('should show ETH balance @watch', function (done) {
    browser.waitForExist('#public_address', 5000)
    browser.execute(getSomeETH, 3)
    browser.waitForExist('#eth_amount', 5000)
    const amount = browser.getHTML('#eth_amount', false)
    assert.equal(amount, 3)
    done()
  })

  it('should show PTI balance', function (done) {
    browser.waitForExist('#public_address', 3000)
    browser.click('a[href="#pti"]')
    browser.execute(getSomePTI, 1412)
    browser.waitForExist('#pti_amount', 5000)
    const amount = browser.getHTML('#pti_amount', false)
    assert.equal(amount, 1412)
    done()
  })
  it('should be able to send some ETH and update the balance @watch', function (done) {
    let description = 'Here is some ETH for you'
    browser.waitForExist('#public_address', 5000)
    browser.execute(getSomeETH, 3)
    // open the send ETH dialog
    browser.waitForExist('#send-eth', 5000)
    browser.click('#send-eth')
    browser.waitForExist('[name="wallet_amount"]', 5000)
    browser.setValue('[name="wallet_friend_number"]', web3.eth.accounts[1])
    browser.setValue('[name="wallet_amount"]', '1.234')
    browser.setValue('[name="tx_description"]', description)
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#send_trans_btn')

    // now check if the amount is updated correctly
    browser.waitForExist('#eth_amount', 5000)
    // this is the result of 3 - 1.234 ETH - transaction costs
    const expectedAmount = '1.76495'
    browser.waitUntil(function () {
      let result = browser.getText('#eth_amount') === expectedAmount
      return result
    }, 10000)

    // TODO: now check the transaction history
    browser.url('http://127.0.0.1:3000/transactions')
    browser.pause(10000)
    done()
  })
})
