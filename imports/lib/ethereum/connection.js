import { paratii } from './paratii.js'
import { getUserPTIAddress } from '../../api/users.js'
import { getRegistryAddress, setRegistryAddress } from './contracts.js'

// let paratii
// TODO: store all this information in a settings.json object
const GAS_PRICE = 50000000000
const GAS_LIMIT = 4e6
// must not define this varable because ethereum-tools will trip

export async function PTIContract () {
  // return a paratii.eth.web3.eth.contract instance for the PTI Contract
  return paratii.eth.getContract('ParatiiToken')
}

export async function updateSession () {
  /* update Session variables with latest information from the blockchain */
  // paratii.config.provider
  Session.set('eth_host', paratii.eth.web3.currentProvider.host)

  // paratii.setting.provider
  /* if paratii.eth.web3 is running over testrpc test contract is deployed */
  if (paratii.eth.web3.currentProvider.host.indexOf('localhost') !== -1) {
    Session.set('isTestRPC', true)
  } else {
    Session.set('isTestRPC', false)
  }

  console.log('Update Session')
  // paratii.paratii.eth.web3.isConnected
  if (paratii.eth.web3.isConnected()) {
    Session.set('eth_isConnected', true)
    // paratii.paratii.eth.web3.blockNumber
    Session.set('eth_currentBlock', paratii.eth.web3.eth.blockNumber)
    Session.set('ParatiiRegistry', getRegistryAddress())
    // paratii.personal.address
    const ptiAddress = getUserPTIAddress()
    if (ptiAddress) {
      // SET PTI BALANCE
      // paratii.eth.contracts.ParatiiToken
      const contract = await paratii.eth.getContract('ParatiiToken')
      if (contract) {
        Session.set('ParatiiToken', contract.address)
        // paratii.personal.getPTIBalance()
        const ptiBalance = await contract.balanceOf(ptiAddress)
        Session.set('pti_balance', ptiBalance.toNumber())
        console.log(`pti_balance of ${ptiAddress} is: ${ptiBalance.toNumber()}`)
      }

      // SET ETH BALANCE
      // paratii.personal.getETHBalance()
      paratii.eth.web3.eth.getBalance(ptiAddress, function (err, result) {
        if (err) { throw err }
        if (result !== undefined) {
          Session.set('eth_balance', result.toNumber())
          console.log(`eth_balance: ${result.toNumber()}`)
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
  console.log('...initializing connection...')
  // # look for wallet in local storage, based on the meteor user or otherwise the 'anonys' wallet
  // serializedWallet = await walletFromLocalStorage()
  // wallet = Paratii.xxx.deseralizeWallet(serializedWallet)

  // paratii.eth.web3.setProvider(new paratii.eth.web3.providers.HttpProvider(Meteor.settings.public.http_provider))

  setRegistryAddress(Meteor.settings.public.ParatiiRegistry)

  // const filter = paratii.paratii.eth.web3.eth.filter('latest')

  paratii.eth.web3.eth.subscribe('newBlockHeaders', function (error, result) {
    if (!error) {
      updateSession()
    } else {
      throw error
    }
  })

  if (Meteor.isServer) {
    console.log('initConnection')
  }

  // paratii = new Paratii({
  //   provider: Meteor.settings.public.http_provider,
  //   registryAddress: Meteor.settings.public.ParatiiRegistry
  //   // wallet: wallet
  // })
}

// export { paratii, paratii.eth.web3, GAS_PRICE, GAS_LIMIT }
export { paratii, GAS_PRICE, GAS_LIMIT }
