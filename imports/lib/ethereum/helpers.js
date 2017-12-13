/*
 * These are helpers for the end-to-end tests in /tests
 * (they would be beter places in /tests/helpers.js, but we are using these in the debug.js screen)
 */

import { add0x } from '../utils.js'
import { web3 } from './web3.js'
// import { paratii } from './paratii.js'
import ParatiiAvatarSpec from './contracts/ParatiiAvatar.json'
import ParatiiRegistrySpec from './contracts/ParatiiRegistry.json'
import ParatiiTokenSpec from './contracts/ParatiiToken.json'
import SendEtherSpec from './contracts/SendEther.json'
import VideoRegistrySpec from './contracts/VideoRegistry.json'
import VideoStoreSpec from './contracts/VideoStore.json'
import { getContract, getParatiiContracts } from './contracts.js'

var promisify = require('promisify-node')

function _deploy (contractSpec, param1, cb) {
  console.log(`deploying contract ${contractSpec.contractName || contractSpec.contract_name}`)
  let owner = web3.eth.accounts[0]
  let contract = web3.eth.contract(contractSpec.abi)
  let contractInstance
  if (param1) {
    contractInstance = contract.new(param1, {
      from: add0x(owner),
      data: contractSpec.bytecode || contractSpec.unlinked_binary,
      gas: web3.toHex(4e6)
    },
    function (err, myContract) {
      if (!err) {
        // NOTE: The callback will fire twice!
        // Once the contract has the transactionHash property set and once its deployed on an address.
        // e.g. check tx hash on the first call (transaction send)
        if (!myContract.address) {
          // check address on the second call (contract deployed)
        } else {
          console.log(`deploying contract ${contractSpec.contractName || contractSpec.contract_name} to ${myContract.address}}`)
          cb(null, myContract)
        }
      } else {
        cb(err, null)
      }
    })
  } else {
    contractInstance = contract.new({
      from: add0x(owner),
      data: contractSpec.bytecode || contractSpec.unlinked_binary,
      gas: web3.toHex(4e6)
    },
    function (err, myContract) {
      if (!err) {
        // NOTE: The callback will fire twice!
        // Once the contract has the transactionHash property set and once its deployed on an address.
        // e.g. check tx hash on the first call (transaction send)
        if (!myContract.address) {
          // check address on the second call (contract deployed)
        } else {
          console.log(`deploying contract ${contractSpec.contractName || contractSpec.contract_name} to ${myContract.address}}`)
          cb(null, myContract)
        }
      } else {
        cb(err, null)
      }
    })
  }
  return contractInstance
}

function deploy (contractSpec, param1) {
  return promisify(_deploy)(contractSpec, param1)
}

export async function deployParatiiContracts () {
  // TODO: this is basically a copy of the migration of the paratii-contracts repo. We need a way to deduplicate this code
  let paratiiRegistry = await deploy(ParatiiRegistrySpec)
  let paratiiAvatar = await deploy(ParatiiAvatarSpec, paratiiRegistry.address)
  let paratiiToken = await deploy(ParatiiTokenSpec)
  let sendEther = await deploy(SendEtherSpec)
  let videoRegistry = await deploy(VideoRegistrySpec)
  let videoStore = await deploy(VideoStoreSpec, paratiiRegistry.address)

  console.log(`registering contracts at the ParatiiRegistry at ${paratiiRegistry.address}`)
  await paratiiRegistry.registerContract('ParatiiAvatar', paratiiAvatar.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('ParatiiToken', paratiiToken.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('SendEther', sendEther.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('VideoRegistry', videoRegistry.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('VideoStore', videoStore.address, {from: web3.eth.accounts[0]})
  console.log('registering contracts done')

  let result = {
    ParatiiAvatar: paratiiAvatar,
    ParatiiRegistry: paratiiRegistry,
    ParatiiToken: paratiiToken,
    SendEther: sendEther,
    VideoRegistry: videoRegistry,
    VideoStore: videoStore
  }

  return result
}

export { getParatiiContracts }

export async function sendSomeETH (beneficiary, amount) {
  let fromAddress = web3.eth.accounts[0]
  // console.log(`Sending ${amount} ETH from ${fromAddress} to ${beneficiary} `)
  let result = await web3.eth.sendTransaction({ from: add0x(fromAddress), to: add0x(beneficiary), value: web3.toWei(amount, 'ether'), gas: 21000, gasPrice: 20000000000 })
  return result
}

export async function sendSomePTI (beneficiary, amount) {
  const contract = await getContract('ParatiiToken')
  let fromAddress = web3.eth.accounts[0]
  let value = amount
  // console.log(`Sending ${value} PTI from ${fromAddress} to ${beneficiary} using contract ${contract}`)
  let result = await contract.transfer(beneficiary, Number(web3.toWei(value)), { gas: 200000, from: fromAddress })
  return result
}

export async function getBalance (address) {
  return web3.eth.getBalance(address)
}

export async function getPTIBalance (address) {
  const contract = await getContract('ParatiiToken')
  return contract.balanceOf(address)
}
