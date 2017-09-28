// Test the setup code used for testing :-)

import { resetDb, mustBeTestChain, createUserAndLogin, setRegistryAddress } from './helpers.js'
import { deployParatiiContracts } from '../imports/lib/ethereum/helpers.js'
import { web3 } from '../imports/lib/ethereum/web3.js'

describe('test setup: @watch', function () {
  let contractAddresses
  before(async function (done) {
    web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'))
    done()
  })

  beforeEach(async function () {
    mustBeTestChain()
    server.execute(resetDb)
    createUserAndLogin(browser)
    contractAddresses = await deployParatiiContracts()
    setRegistryAddress(browser, contractAddresses['ParatiiRegistry'].address)
  })

  it('paratiicontract functions should work', function () {
    let result
    result = browser.execute(function () {
      const contracts = require('./imports/lib/ethereum/contracts.js')
      let registryAddress = contracts.getRegistryAddress()
      return registryAddress
    })
    assert.equal(result.value, contractAddresses['ParatiiRegistry'].address)
    result = browser.executeAsync(function (done) {
      const contracts = require('./imports/lib/ethereum/contracts.js')
      contracts.getContractAddress('ParatiiToken').then(
        function (address) {
          done(address)
        }
      )
    })
    assert.equal(result.value, contractAddresses['ParatiiToken'].address)
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
