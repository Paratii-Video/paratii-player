// Test the setup code used for testing :-)

import { resetDb, createUserAndLogin, setRegistryAddress, getOrDeployParatiiContracts, web3 } from './helpers.js'
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

  it('should have sane default settings', function () {
    // the `VideoRedistributionPoolShare` should be set to some reasonable number
    let share = contracts.ParatiiRegistry.getNumber('VideoRedistributionPoolShare')
    console.log(share)
    assert.equal(Number(share), web3.toWei(0.3))
    // check if the VideoStore is whitelisted
    let isOnWhiteList = contracts.ParatiiAvatar.isOnWhiteList(contracts.VideoStore.address)
    assert.equal(isOnWhiteList, true)
  })
  it('getUserPTIAddress function should work [TODO]', function () {
    // let result
    // result =  browser.executeAsync(
    //   function(done) {
    //     let users = require('/imports/api/users.js')
    //     let wallet = require('/imports/lib/ethereum/wallet.js')
    //     done(users.getUserPTIAddress())
    //   }
    // )
    // console.log(result)
    // console.log('----------------')
    // assert.equal(result.value, contractAddresses['ParatiiToken'].address)
  })
})
