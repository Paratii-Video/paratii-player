import { web3 } from './web3.js'
import { getContract, setRegistryAddress } from './contracts.js'

let paratii
// TODO: store all this information in a settings.json object
const GAS_PRICE = 50000000000
const GAS_LIMIT = 4e6
// must not define this varable because ethereum-tools will trip

export async function PTIContract () {
  // return a web3.eth.contract instance for the PTI Contract
  return getContract('ParatiiToken')
}

export const initConnection = function () {
  console.log('...initializing connection...')
  // # look for wallet in local storage, based on the meteor user or otherwise the 'anonys' wallet
  // serializedWallet = await walletFromLocalStorage()
  // wallet = Paratii.xxx.deseralizeWallet(serializedWallet)

  web3.setProvider(new web3.providers.HttpProvider(Meteor.settings.public.http_provider))

  setRegistryAddress(Meteor.settings.public.ParatiiRegistry)

  // const filter = paratii.web3.eth.filter('latest')
  const filter = web3.eth.filter('latest')

  filter.watch(function (error, result) {
    if (!error) {
      // updateSession()
    }
  })
  if (Meteor.isServer) {
    console.log('initConnection')
  }
}

export { paratii, web3, GAS_PRICE, GAS_LIMIT }
