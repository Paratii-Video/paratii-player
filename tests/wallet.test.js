import { resetDb, mustBeTestChain, createUserAndLogin, getSomeEth, getSomePTI } from './helpers.js'
import { deployParatiiContracts } from './deployContracts.js'

describe('wallet', function () {
  beforeEach(function () {
    mustBeTestChain()
    server.execute(resetDb)
  })

  afterEach(function () {

  })

  it('should be able to send some ETH', function () {
    console.log('create user')
    createUserAndLogin(browser)
    browser.waitForExist('#public_address', 3000)
    console.log('send some eth to our user')
    browser.execute(getSomeEth, 1)
    console.log('did it arrive?')
    browser.waitForExist('#eth_amount', 10000)
    const amount = browser.getHTML('#eth_amount', false)
    assert.equal(amount, 1)
  })

  it('should be able to send some PTI @watch', async function () {
    createUserAndLogin(browser)
    browser.execute(getSomeEth, 100000)
    await deployParatiiContracts()
  // browser.executeAsync(function(done) { deployTestContracts(); done()} )
    browser.waitForExist('#public_address', 3000)
    browser.click('a[href="#pti"]')
    browser.pause(3000)
    browser.execute(getSomePTI, 1)
    browser.pause(3000)
    browser.waitForExist('#pti_amount')
    const amount = browser.getHTML('#pti_amount', false)
    assert.equal(amount, 1)
  })
})
