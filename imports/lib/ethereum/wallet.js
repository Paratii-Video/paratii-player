import * as RLocalStorage from 'meteor/simply:reactive-local-storage'
import lightwallet from 'eth-lightwallet/dist/lightwallet.js'
import { Accounts } from 'meteor/accounts-base'
import { add0x } from '/imports/lib/utils.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { web3 } from './web3.js'
import { GAS_PRICE, GAS_LIMIT } from './connection.js'
import { getContract } from './contracts.js'

// createKeystore will create a new keystore
// save it in the session object and in local storage
// generate an address, and save that in the sesssion too
function createKeystore (password, seedPhrase, cb) {
  // create a new seedPhrase if we have none

  Session.set('generating-keystore', true)
  if (seedPhrase == null) {
    seedPhrase = lightwallet.keystore.generateRandomSeed()
  }

  // create a new keystore with the given password and seedPhrase
  const opts = {
    password,
    seedPhrase
  }
  lightwallet.keystore.createVault(opts, function (err, keystore) {
    if (err) {
      cb(err)
      return
    }

    // while we are at it, also generate an address for our user
    keystore.keyFromPassword(password, function (error, pwDerivedKey) {
      if (error) {
        cb(error)
        return
      }
      // generate one new address/private key pairs
      // the corresponding private keys are also encrypted
      keystore.generateNewAddress(pwDerivedKey, 1)
      const address = keystore.getAddresses()[0]

      if (Accounts.userId() !== null) {
        // if there is a logged user, save as always
        saveKeystore(seedPhrase, keystore.serialize(), address)
      } else {
        // else, save in a temporary session variable
        Session.set('tempSeed', seedPhrase)
        Session.set(`tempKeystore`, keystore.serialize())
        Session.set('tempAddress', add0x(address))
      }
      Session.set('generating-keystore', false)
      if (cb) {
        cb(error, seedPhrase)
      }
    })
  })
}

// save the seed, keystore and address in the session
function saveKeystore (seedPhrase, keystore, address) {
  Session.set('seed', seedPhrase)
  RLocalStorage.setItem(`keystore-${Accounts.userId()}`, keystore)
  Session.set(`keystore-${Accounts.userId()}`, keystore)

  Session.set('userPTIAddress', add0x(address))
  // TODO: we do not seem to be using this anymore...
  Meteor.call('users.update', { 'profile.ptiAddress': add0x(address) })
}

// getKeystore tries to load the keystore from the Session,
// or, if it is not found there, restore it from localstorage.
// If no keystore can be found, it returns undefined.
export function getKeystore () {
  let serializedKeystore
  serializedKeystore = Session.get(`keystore-${Accounts.userId()}`)
  if (serializedKeystore === undefined) {
    serializedKeystore = RLocalStorage.getItem(`keystore-${Accounts.userId()}`)
    if (serializedKeystore !== null) {
      Session.set(`keystore-${Accounts.userId()}`, serializedKeystore)
    }
  }
  // using lightwallet to deserialize the keystore
  if (serializedKeystore !== null) {
    const keystore = lightwallet.keystore.deserialize(serializedKeystore)
    const address = keystore.getAddresses()[0]
    Session.set('userPTIAddress', add0x(address))
    return keystore
  }
  return null
}

// returns the seed of the keystore
function getSeed (password, callback) {
  const keystore = getKeystore()
  if (keystore !== null) {
    keystore.keyFromPassword(password, function (err, pwDerivedKey) {
      if (err) {
        Session.set('errorMessage', 'Incorrect password')
        if (callback) {
          callback(err, null)
        }
        return
      }
      Session.set('errorMessage', null)
      const seed = keystore.getSeed(pwDerivedKey)
      Session.set('seed', seed)
      if (callback) {
        callback(err, seed)
      }
    })
  }
}

function restoreWallet (password, seedPhrase, cb) {
  return createKeystore(password, seedPhrase, cb)
}
// function buyVideo (videoId) {
//   sendTransaction(password, 'VideoStore', [videoId])
// }

function sendTransaction (password, contractName, functionName, args, value, callback) {
  // send some ETH or PTI
  // @param value The amount of ETH to transfer (expressed in Wei)
  //
  if (!value) {
    value = 0
  }
  if (!args) {
    args = []
  }
  console.log(`Sending transaction: ${contractName}.${functionName}(${args}), with value ${value}`)
  const fromAddr = getUserPTIAddress()
  const nonce = web3.eth.getTransactionCount(fromAddr)
  const keystore = getKeystore()
  keystore.keyFromPassword(password, async function (error, pwDerivedKey) {
    let contract
    if (error) throw error
    // sign the transaction
    const txOptions = {
      nonce: web3.toHex(nonce),
      gasPrice: web3.toHex(GAS_PRICE),
      gasLimit: web3.toHex(GAS_LIMIT)
    }

    let rawTx
    contract = await getContract(contractName)
    txOptions.to = contract.address
    txOptions.value = web3.toHex(value)
    rawTx = lightwallet.txutils.functionTx(contract.abi, functionName, args, txOptions)
    const tx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr)
    web3.eth.sendRawTransaction(`0x${tx}`, function (err, hash) {
      console.log('Transaction sent: calling callback', callback)
      if (callback) {
        callback(err, hash)
      } else {
        if (err) {
          throw err
        }
      }
    })
  })
}

export { createKeystore, restoreWallet, sendTransaction, getSeed, saveKeystore }
