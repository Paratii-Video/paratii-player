import { web3, resetDb, createUserAndLogin, getSomeETH, getSomePTI, setRegistryAddress, getUserPTIAddressFromBrowser } from './helpers.js'
import { sendSomeETH, deployParatiiContracts } from '../imports/lib/ethereum/helpers.js'
describe('wallet', function () {
  let contractAddresses, userAccount

  before(async function (done) {
    browser.url('http://127.0.0.1:3000')
    contractAddresses = await deployParatiiContracts()
    setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
    done()
  })

  beforeEach(function () {
    server.execute(resetDb)
    createUserAndLogin(browser)
    browser.waitForExist('#public_address', 5000)
    userAccount = getUserPTIAddressFromBrowser()
  })

  it('should show ETH balance @watch', async function (done) {
    // sendSomeETH(userAccount, 3.1)
    browser.execute(getSomeETH, 3.1)
    browser.waitForExist('#eth_amount', 5000)
    const amount = await browser.getHTML('#eth_amount', false)
    assert.equal(amount, 3.1)
    done()
  })

  it('should show PTI balance', async function (done) {
    sendSomeETH(userAccount, 1)
    browser.execute(getSomePTI, 321)
    browser.click('a[href="#pti"]')
    browser.waitForExist('#pti_amount', 5000)
    const amount = await browser.getHTML('#pti_amount', false)
    assert.equal(amount, 321)
    done()
  })

  it('should be able to send some PTI, update the balance and transaction history', function (done) {
    sendSomeETH(userAccount, 1)
    let description = 'Here is some PTI for you'
    let toAddress = web3.eth.accounts[2]
    browser.execute(getSomePTI, 1412)
    // open the send PTI dialog
    browser.click('a[href="#pti"]')
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
    assert.equal(browser.getText('.transaction-to')[0], toAddress)

    // TODO: do the PTI transactions via a custom contact that logs the description, so we can get the description from there
    // browser.waitForExist('.transaction-description', 5000)
    // assert.equal(browser.getText('.transaction-description'), description)

    done()
  })

  it('should be able to send some ETH, update the balance and transaction history', function (done) {
    let description = 'Here is some ETH for you'
    browser.waitForExist('#public_address', 5000)
    browser.execute(getSomeETH, 3)
    browser.waitForExist('#eth_amount', 5000)
    // open the send ETH dialog
    browser.waitForExist('#send-eth', 5000)
    browser.click('#send-eth')
    browser.waitForEnabled('[name="wallet_amount"]', 5000)
    browser.pause(2000)
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

  it('should be possible to buy (and unlock) a video [TODO]', function (done) {
    browser.waitForExist('#public_address', 5000)
    browser.execute(getSomeETH, 3)
    browser.waitForExist('#eth_amount', 5000)
    browser.execute(getSomePTI, 300)
    browser.click('a[href="#pti"]')
    browser.waitForExist('#pti_amount', 5000)
    const amount = browser.getHTML('#pti_amount', false)
    assert.equal(amount, 300)
    browser.url('http://127.0.0.1:3000/play/5')
    browser.waitForEnabled('#unlock-video', 5000)
    browser.click('#unlock-video')
    browser.waitForEnabled('[name="user_password"]')
    browser.pause(1000)
    browser.setValue('[name="user_password"]', 'password')
    browser.click('#send_trans_btn')
    // TODO: check if the video has actually been acquired!
    browser.pause(4000)
    done()
  })
})
