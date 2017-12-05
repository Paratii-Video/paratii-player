import { Paratii } from 'paratii-lib'
import { web3 } from './web3.js'
import { getUserPTIAddress } from '../../api/users.js'
import { getContract, getRegistryAddress } from './contracts.js'
let paratii

// TODO: store all this information in a settings.json object
const GAS_PRICE = 50000000000
const GAS_LIMIT = 4e6
// must not define this varable because ethereum-tools will trip

export async function PTIContract () {
  // return a web3.eth.contract instance for the PTI Contract
  return getContract('ParatiiToken')
}

export async function updateSession () {
  /* update Session variables with latest information from the blockchain */
  // paratii.config.provider
  Session.set('eth_host', web3.currentProvider.host)

  // paratii.settings.provider
  /* if Web3 is running over testrpc test contract is deployed */
  if (web3.currentProvider.host.indexOf('localhost') !== -1) {
    Session.set('isTestRPC', true)
  } else {
    Session.set('isTestRPC', false)
  }

  // paratii.web3.isConnected
  if (web3.isConnected()) {
    Session.set('eth_isConnected', true)
    // paratii.web3.blockNumber
    Session.set('eth_currentBlock', web3.eth.blockNumber)
    Session.set('ParatiiRegistry', getRegistryAddress())
    // paratii.personal.address
    const ptiAddress = getUserPTIAddress()
    if (ptiAddress) {
      // SET PTI BALANCE
      // paratii.eth.contracts.ParatiiToken
      const contract = await getContract('ParatiiToken')
      if (contract) {
        Session.set('ParatiiToken', contract.address)
        // paratii.personal.getPTIBalance()
        const ptiBalance = await contract.balanceOf(ptiAddress)
        Session.set('pti_balance', ptiBalance.toNumber())
      }

      // SET ETH BALANCE
      // paratii.personal.getETHBalance()
      web3.eth.getBalance(ptiAddress, function (err, result) {
        if (err) { throw err }
        if (result !== undefined) {
          Session.set('eth_balance', result.toNumber())
        } else {
          Session.set('eth_balance', 0)
        }
      })
    }
  } else {
    Session.set('eth_isConnected', false)
    // Session.set('eth_currentBlock', null)
    Session.set('eth_highestBlock', null)
    // Session.set('eth_balance', null)
    // Session.set('pti_balance', null)
  }
}

export const initConnection = function () {
  console.log('initializing connection..')
  // # look for wallet in local storage, based on the meteor user or otherwise the 'anonys' wallet
  // serializedWallet = await walletFromLocalStorage()
  // wallet = Paratii.xxx.deseralizeWallet(serializedWallet)
  paratii = Paratii({
    provider: Meteor.settings.public.http_provider,
    registryAddress: Meteor.settings.public.ParatiiRegistry
    // wallet: wallet
  })
  web3.setProvider(new web3.providers.HttpProvider(Meteor.settings.public.http_provider))

  const filter = paratii.web3.eth.filter('latest')
  filter.watch(function (error, result) {
    if (!error) {
      updateSession()
    }
  })
  if (Meteor.isServer) {
    console.log('initConnection')
  }
}

export { paratii, web3, GAS_PRICE, GAS_LIMIT }
