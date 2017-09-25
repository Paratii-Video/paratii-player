import ParatiiRegistry from './contracts/ParatiiRegistry.json'
export let PARATII_REGISTRY_ADDRESS

export function setRegistryAddress (address) {
  PARATII_REGISTRY_ADDRESS = address
}

export function getRegistryAddress () {
  return PARATII_REGISTRY_ADDRESS
}

export function getParatiiRegistry () {
  let address = getRegistryAddress()
  if (!address) {
    let msg = `No paratii registry address known!`
    throw msg
  }
  return web3.eth.contract(ParatiiRegistry.abi).at(address)
}

export async function getContractAddress (name) {
  console.log('getContractAddress', name)
  if (name === 'ParatiiRegistry') {
    return PARATII_REGISTRY_ADDRESS
  }
  if (Session.get(name + '-Adress')) {
    return Session.get(name + '-Adress')
  } else {
    console.log(`getting address of the contract "${name}" from the registry`)
    try {
      console.log(getParatiiRegistry())
      let address = await getParatiiRegistry().getContract(name)
      console.log(`contract ${name} is located at ${address}`)
      return address
    } catch (err) {
      console.log(err)
    }
  }
}

export async function getContracts () {
  let contracts = {}
  contracts.ParatiiRegistry = {
    address: getRegistryAddress()
  }
  return contracts
}
