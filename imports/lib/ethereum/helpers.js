import { add0x } from '../utils.js'
import { web3 } from './web3.js'
import ParatiiAvatarSpec from './contracts/ParatiiAvatar.json'
import ParatiiRegistrySpec from './contracts/ParatiiRegistry.json'
import ParatiiTokenSpec from './contracts/ParatiiToken.json'
import SendEtherSpec from './contracts/SendEther.json'
import VideoRegistrySpec from './contracts/VideoRegistry.json'
import VideoStoreSpec from './contracts/VideoStore.json'

var promisify = require('promisify-node')

function _deploy (contractSpec, cb) {
  console.log(`deploying contract ${contractSpec.contractName}`)
  let owner = web3.eth.accounts[0]
  let contract = web3.eth.contract(contractSpec.abi)
  let contractInstance = contract.new({
    from: add0x(owner),
    // data: contractSpec.unlinked_binary,
    data: contractSpec.bytecode,
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
        cb(null, myContract)
      }
    } else {
      cb(err, null)
    }
  })
  return contractInstance
}
function deploy (contractSpec) {
  return promisify(_deploy)(contractSpec)
}

export async function deployParatiiContracts () {
  console.log(await web3.eth.getBalance(web3.eth.accounts[0]))
  let paratiiAvatar = await deploy(ParatiiAvatarSpec)
  let paratiiToken = await deploy(ParatiiTokenSpec)
  let paratiiRegistry = await deploy(ParatiiRegistrySpec)
  let sendEther = await deploy(SendEtherSpec)
  let videoRegistry = await deploy(VideoRegistrySpec)
  let videoStore = await deploy(VideoStoreSpec)

  await paratiiRegistry.registerContract('ParatiiAvatar', paratiiAvatar.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('ParatiiToken', paratiiToken.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('SendEther', sendEther.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('VideoRegistry', videoRegistry.address, {from: web3.eth.accounts[0]})
  await paratiiRegistry.registerContract('VideoStore', videoStore.address, {from: web3.eth.accounts[0]})

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
