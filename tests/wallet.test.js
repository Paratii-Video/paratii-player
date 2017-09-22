import { resetDb, mustBeTestChain, createUserAndLogin, getSomeETH, getSomePTI } from './helpers.js'
import { deployParatiiContracts, setRegistryAddress } from './deployContracts.js'

describe('wallet', function () {
  let contractAddresses

  before(async function () {
    mustBeTestChain()
    contractAddresses = await deployParatiiContracts()
  })

  beforeEach(async function () {
    server.execute(resetDb)
    createUserAndLogin(browser)
    setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
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

  it('should be able to send some PTI @watch', function (done) {
    browser.waitForExist('#public_address', 3000)
    browser.click('a[href="#pti"]')
    browser.execute(getSomePTI, 1412)
    browser.waitForExist('#pti_amount', 5000)
    const amount = browser.getHTML('#pti_amount', false)
    assert.equal(amount, 1412)
    done()
  })
})
