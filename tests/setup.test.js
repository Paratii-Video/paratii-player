// Test the setup code used for testing :-)

import {
  paratii,
  resetDb,
  createUserAndLogin,
  setRegistryAddress,
  getOrDeployParatiiContracts
} from './helpers.js'
import { assert } from 'chai'

describe('test setup:', function () {
  let contracts

  before(async function (done) {
    done()
  })

  beforeEach(async function () {
    // mustBeTestChain()
    server.execute(resetDb)
    createUserAndLogin(browser)
    contracts = await getOrDeployParatiiContracts(server, browser)
    setRegistryAddress(browser, contracts.ParatiiRegistry.address)
    paratii.eth.setRegistryAddress(contracts.ParatiiRegistry.address)
  })

  it('paratiicontract functions should work', function () {
    let result
    result = browser.execute(function () {
      const contracts = require('./imports/lib/ethereum/contracts.js')
      let registryAddress = contracts.getRegistryAddress()
      return registryAddress
    })
    assert.equal(result.value, contracts.ParatiiRegistry.address)
    result = browser.executeAsync(function (done) {
      const contracts = require('./imports/lib/ethereum/contracts.js')
      contracts.getContractAddress('ParatiiToken').then(
        function (address) {
          done(address)
        }
      )
    })
    assert.equal(result.value, contracts.ParatiiToken.address)
  })

  it.skip('should have sane default settings', function () {
    // the `VideoRedistributionPoolShare` should be set to some reasonable number
    console.log(contracts.ParatiiRegistry.methods)
    let share = contracts.ParatiiRegistry.methods.getUint('VideoRedistributionPoolShare').call()
    assert.equal(Number(share), paratii.eth.web3.utils.toWei('0.3'))
    // check if the VideoStore is whitelisted
    let isOnWhiteList = contracts.ParatiiAvatar.methods.isOnWhiteList(contracts.VideoStore.address).call()
    assert.equal(isOnWhiteList, true)
  })
})
