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
    if (paratiiRegistryAddress.value) {
      // TODO: (optimization) we do not need to deploy the contracts - they are already deployed
      contractAddresses = await deployParatiiContracts()
      setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
    } else {
      contractAddresses = await deployParatiiContracts()
      setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
    }
    done()
  })

  beforeEach(async function () {
    server.execute(resetDb)
    createUserAndLogin(browser)
  })

  afterEach(function () {

  })

  it('should show ETH balance', function (done) {
    browser.waitForExist('#public_address', 5000)
    browser.execute(getSomeETH, 3)
    browser.waitForExist('#eth_amount', 5000)
    const amount = browser.getHTML('#eth_amount', false)
    assert.equal(amount, 3)
    done()
  })

  it('should be able to send some PTI, update the balance and transaction history  @watch', function (done) {
    let description = 'Here is some PTI for you'
    let toAddress = web3.eth.accounts[2]
    browser.waitForExist('#public_address', 3000)
    browser.click('a[href="#pti"]')
    browser.execute(getSomePTI, 1412)
    // also need some ETH to send the transaction
    browser.execute(getSomeETH, 3)
    browser.waitForExist('#pti_amount', 5000)
    const amount = browser.getHTML('#pti_amount', false)
    assert.equal(amount, 1412)

    // open the send PTI dialog
    browser.waitForExist('#send-pti', 5000)
    browser.click('#send-pti')
    browser.waitForEnabled('[name="wallet_friend_number"]', 5000)
    browser.pause(2000)
    browser.setValue('[name="wallet_friend_number"]', toAddress)
    browser.setValue('[name="wallet_amount"]', '5')
    browser.setValue('[name="tx_description"]', description)
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#send_trans_btn')

    // now check if the amount is updated correctly
    browser.waitForExist('#pti_amount', 5000)
    // this is the result of 3 - 1.234 ETH - transaction costs
    const expectedAmount = '1407'
    browser.waitUntil(function () {
      return browser.getText('#pti_amount').substr(0, 4) === expectedAmount
    }, 10000)

    // we should see our transaction description in the transaction history
    browser.click('#transaction-history')

    browser.waitForExist('.transaction-to', 5000)
    assert.equal(browser.getText('.transaction-to'), toAddress)

    // TODO: do the PTI transactions via a custom contact that logs the description, so we can get the description from there
    // browser.waitForExist('.transaction-description', 5000)
    // assert.equal(browser.getText('.transaction-description'), description)

    done()
  })
  it('should be able to send some ETH, update the balance and transaction history @watch', function (done) {
    let description = 'Here is some ETH for you'
    browser.waitForExist('#public_address', 5000)
    browser.execute(getSomeETH, 3)
    browser.waitForExist('#eth_amount', 5000)
    // open the send ETH dialog
    browser.waitForExist('#send-eth', 5000)
    browser.click('#send-eth')
    browser.waitForEnabled('[name="wallet_amount"]', 5000)
    browser.setValue('[name="wallet_friend_number"]', web3.eth.accounts[1])
    browser.setValue('[name="wallet_amount"]', '1.234')
    browser.setValue('[name="tx_description"]', description)
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#send_trans_btn')

    // now check if the amount is updated correctly
    browser.waitForExist('#eth_amount', 5000)
    // this is the result of 3 - 1.234 ETH - transaction costs
    const expectedAmount = '1.76'
    browser.waitUntil(function () {
      return browser.getText('#eth_amount').substr(0, 4) === expectedAmount
    }, 10000)

    // we should see our transaction description in the transaction history
    browser.click('#transaction-history')
    browser.waitForExist('.transaction-description', 5000)
    assert.equal(browser.getText('.transaction-description'), description)

    done()
  })
})
