
import { add0x } from '../imports/lib/utils.js'
import Web3 from 'web3'
import ParatiiRegistrySpec from '../imports/lib/ethereum/contracts/ParatiiRegistry.json'
import ParatiiTokenSpec from '../imports/lib/ethereum/contracts/ParatiiToken.json'

let web3 = new Web3()
let DEFAULT_PROVIDER = 'http://localhost:8545'
web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER))
let owner = web3.eth.accounts[0]

function _deploy (contractSpec, cb) {
  console.log('deploying contract')
  let contract = web3.eth.contract(contractSpec.abi)
  let contractInstance = contract.new({
    from: add0x(owner),
    data: contractSpec.unlinked_binary,
    gas: web3.toHex(4e6)
  },
    function (err, myContract) {
      console.log('callback')
      if (!err) {
         // NOTE: The callback will fire twice!
         // Once the contract has the transactionHash property set and once its deployed on an address.
         // e.g. check tx hash on the first call (transaction send)
        if (!myContract.address) {

         // check address on the second call (contract deployed)
        } else {
          // setContractAddress(myContract.address)
          Meteor.call('resetFilter', {
            contract: myContract.address
          })
          console.log('cb')
          cb(null, myContract)
        }
      } else {
        cb(err, null)
      }
    })
  return contractInstance
}
function deploy (contractSpec) {
  return Promise.promisify(_deploy)(contractSpec)
}
export async function deployParatiiContracts () {
  console.log(await web3.eth.getBalance(web3.eth.accounts[0]))
  let paratiiToken = await deploy(ParatiiTokenSpec)
  // let paratiiRegistry = await deploy(ParatiiRegistrySpec)
  return
  // console.log(paratiiRegistry)
  // console.log(paratiiRegistry.address)
  // // paratiiRegistry = web3.eth.contract(ParatiiRegistrySpec.abi).at(paratiiRegistry.address)
  // await paratiiRegistry.registerContract('ParatiiToken', paratiiToken.address, {from: web3.eth.accounts[0]})
}
