import { web3 } from './web3.js'
// import { paratii } from './connection.js'
import ParatiiAvatarSpec from './contracts/ParatiiAvatar.json'
import ParatiiRegistrySpec from './contracts/ParatiiRegistry.json'
import ParatiiTokenSpec from './contracts/ParatiiToken.json'
import SendEtherSpec from './contracts/SendEther.json'
import VideoRegistrySpec from './contracts/VideoRegistry.json'
import VideoStoreSpec from './contracts/VideoStore.json'

const CONTRACTS = {
  'ParatiiAvatar': {
    spec: ParatiiAvatarSpec
  },
  'ParatiiRegistry': {
    spec: ParatiiRegistrySpec
  },
  'ParatiiToken': {
    spec: ParatiiTokenSpec
  },
  'SendEther': {
    spec: SendEtherSpec
  },
  'VideoRegistry': {
    spec: VideoRegistrySpec
  },
  'VideoStore': {
    spec: VideoStoreSpec
  }
}

export function setRegistryAddress (address) {
  Meteor.settings.public.ParatiiRegistry = address
}

export function getRegistryAddress () {
  return Meteor.settings.public.ParatiiRegistry
  // return paratii.config.registryAddress
}

export function getParatiiRegistry () {
  // return paratii.contracts.ParatiiRegistry
  let address = getRegistryAddress()
  if (!address) {
    let msg = `No paratii registry address known!`
    throw Error(msg)
  }
  return web3.eth.contract(ParatiiRegistrySpec.abi).at(address)
}

// TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
export async function getContractAddress (name) {
  // paratii.eth.getContractAddress(name)
  if (name === 'ParatiiRegistry') {
    return getRegistryAddress()
  }
  try {
    let address = await getParatiiRegistry().getContract(name)
    // console.log(`contract ${name} is located at ${address}`)
    return address
  } catch (err) {
    console.log(err)
  }
}

export async function getContract (name) {
  // paratii.eth.getContract(name)
  let contractInfo = CONTRACTS[name]
  if (!contractInfo) {
    throw Error(`No contract with name "${name}" is known`)
  }
  let address = await getContractAddress(name)
  if (address) {
    const contract = web3.eth.contract(contractInfo.spec.abi).at(address)
    return contract
  }
}

export async function getParatiiContracts () {
  // paratii.eth.getContracts()
  let contracts = {}
  let contractNames = [
    'ParatiiAvatar',
    'ParatiiToken',
    'ParatiiRegistry',
    'SendEther',
    'VideoRegistry',
    'VideoStore'
  ]
  for (let i = 0; i < contractNames.length; i++) {
    contracts[contractNames[i]] = await getContract(contractNames[i])
  }
  return contracts
}
