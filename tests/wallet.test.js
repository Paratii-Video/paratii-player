import { resetDb, mustBeTestChain, createUserAndLogin, getSomePTI } from './helpers.js'
import { deployParatiiContracts, setRegistryAddress } from './deployContracts.js'

describe('wallet', function () {
  let contractAddresses

  beforeEach(async function () {
    mustBeTestChain()
    server.execute(resetDb)
    createUserAndLogin(browser)
    contractAddresses = await deployParatiiContracts()
    setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
  })

  afterEach(function () {

  })

  // it('should show ETH balance [BROKEN - te be rewritten with new SendEther contract]', function (done) {
  //   // browser.waitForExist('#public_address', 3000)
  //   // const public_address = browser.getHTML('#public_address', false)
  //   // console.log(public_address)
  //   // browser.execute(getSomeEth, 3141)
  //   // let bal = web3.eth.getBalance(public_address)
  //   // // browser.waitForExist('#eth_amount', 30000)
  //   // // const amount = browser.getHTML('#eth_amount', false)
  //   // // assert.equal(amount, 3141)
  //   // // done()
  // })

  it('should be able to send some PTI', function (done) {
    browser.waitForExist('#public_address', 3000)
    browser.click('a[href="#pti"]')
    browser.pause(3000)

    browser.execute(getSomePTI, 1412)
    browser.waitForExist('#pti_amount', 10000)
    const amount = browser.getHTML('#pti_amount', false)
    console.log(amount)
    assert.equal(amount, 1412)

    done()
  })
})
