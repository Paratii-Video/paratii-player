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
}

export function getParatiiRegistry () {
  let address = getRegistryAddress()
  if (!address) {
    let msg = `No paratii registry address known!`
    throw Error(msg)
  }
  return web3.eth.contract(ParatiiRegistrySpec.abi).at(address)
}

export async function getContractAddress (name) {
  console.log('getContractAddress', name)
  if (name === 'ParatiiRegistry') {
    return Meteor.settings.public.ParatiiRegistry
  }
  // if (false && Session.get('contracts')) {
  //   return Session.get('contracts')[name]
  // } else {
  console.log(`getting address of the contract "${name}" from the registry`)
  try {
    let address = await getParatiiRegistry().getContract(name)
    console.log(`contract ${name} is located at ${address}`)
    return address
  } catch (err) {
    console.log(err)
  }
  // }
}

export async function getContract (name) {
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

export async function getContracts () {
  let contracts = {}
  let contractNames = [
    'ParatiiAvatar',
    'ParatiiToken',
    'PartiiRegistry',
    'SendEther',
    'VideoRegistry',
    'VideoStore'
  ]
  for (let i = 0; i < contractNames.length; i++) {
    contracts[contractNames[i]] = await getContractAddress(contractNames[i])
  }
  return contracts
}
