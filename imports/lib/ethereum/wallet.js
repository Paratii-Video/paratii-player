import * as RLocalStorage from 'meteor/simply:reactive-local-storage'
import lightwallet from 'eth-lightwallet/dist/lightwallet.js'
import { Accounts } from 'meteor/accounts-base'
import { add0x, showModal } from '/imports/lib/utils.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { paratii } from './paratii.js'
import { GAS_PRICE, GAS_LIMIT } from './connection.js'

// createKeystore will create a new keystore, and save it in the session object and in local storage
// it generates an address, and save that in the session too
async function createKeystore (password, seedPhrase, key, cb) {
  console.log(key)
  // create a new seedPhrase if we have none, and save in in localstorage under 'keystore-{key}'
  console.log('create keystore')
  Session.set('generating-keystore', true)
  // wallet = paratii.paratii.eth.web3.eth.accounts.wallet.create(1, seedPhrase)
  if (seedPhrase == null) {
    // seedPhrase = paratii.eth.wallet.newMnemonic() will generate a raondom seed
    seedPhrase = paratii.eth.wallet.newMnemonic()
  }
  // create a new keystore with the given password and seedPhrase
  await paratii.eth.wallet.clear()
  let wallet = await paratii.eth.wallet.create(1, seedPhrase)

  console.log('wallet')
  let address = wallet[0].address
  let encrypted = await wallet.encrypt(password)
  console.log('encrypted')
  console.log(encrypted)

  if (key) {
    // if there is a logged user, save the keystore under the given key
    saveKeystore(seedPhrase, encrypted, address, key)
    Meteor.call('users.update', { 'profile.ptiAddress': add0x(address) })
  } else {
    // else, save in a temporary session variable
    // Session.set('tempSeed', seedPhrase)
    Session.set('tempKeystore', encrypted)
    Session.set('tempAddress', add0x(address))
    Session.set('seed', null)
  }

  Session.set('generating-keystore', false)
  // saveKeystore(seedPhrase, serailized, password, ..)
}

// save the seed, keystore and address in the session
function saveKeystore (seedPhrase, keystore, address, key) {
  if (!key) {
    throw Error('No key given1')
  }
  console.log('save keystore')
  // save the keystiore undeer `keystore-${key}`
  Session.set('seed', seedPhrase)
  RLocalStorage.setItem(`keystore-${key}`, keystore)
  Session.set(`keystore-${key}`, keystore)
  console.log(`keystore with ${key}: address: ${address}`)
  Session.set('userPTIAddress', add0x(address))
}

function createAnonymousKeystoreIfNotExists () {
  const keystores = keystoresCheck()
  // if there isn't anonyous keystore, we create one
  if (keystores.anonymous === 0) {
    console.log('creating anonymous keystore')
    Session.set('wallet-state', 'generating')
    createKeystore('password', undefined, 'anonymous', function (err, seedPhrase, keystore) {
      if (err) {
        throw err
      }
      // Need to save keystore
      console.log('-----')
      console.log(keystore)
      RLocalStorage.setItem(`keystore-anonymous`, keystore.serialize())
      if (keystore) {
        Session.set(`keystore-anonymous`, keystore)
        Session.set(`seed-anonymous`, seedPhrase)
        Session.set('tempKeystore', null)
        Session.set('wallet-state', '')
        console.log('Anonymous keystore created')
      }
    })
  }
}

function mergeOrCreateNewWallet (password) {
  const anonymousKeystore = getKeystore('anonymous')
  const key = Meteor.userId()
  if (password !== undefined) {
    if (anonymousKeystore !== null) {
      // we have an anonmous keystore - we need to regenarate a new keystore
      // with the same seed but the new password
      // personal.wallet.mnemonic
      getSeedFromKeystore('password', anonymousKeystore, function (err, seedPhrase) {
        if (err) {
          throw err
        }
        // wallet = personal.wallet.create(seedPhrase)
        // keystore = wallet.encrypt(password)
        createKeystore(password, seedPhrase, key, function (error, result) {
          if (error) {
            throw error
          }
          // hideModal()
          console.log('show seed')
          showModal('showSeed')
          deleteKeystore('anonymous')
          Session.set('user-password', null)
        })
      })
    } else {
      // There is no anonymous keystore, i create a keystore
      console.log('no anonymous keystore found')
      createKeystore(password, null, key, function (error, result) {
        if (error) {
          throw error
        }
        // hideModal()
        showModal('showSeed')
      })
    }
  } else {
    console.log('anonymousKeystore is not null, we have no keystore, this was an existing user,')
    showModal('regenerateKeystore', {blocking: true})
  }
}

// getKeystore tries to load the keystore from the Session,
// or, if it is not found there, restore it from localstorage.
// If no keystore can be found, it returns undefined.
export function getKeystore (user = null) {
  let serializedKeystore
  let userId = Accounts.userId()
  // If the user is not logged in
  if (user === 'anonymous' || userId === null) {
    userId = 'anonymous'
  }
  // serializedKeystore = Session.get(`keystore-${userId}`)
  // if (serializedKeystore === undefined) {
  serializedKeystore = RLocalStorage.getItem(`keystore-${userId}`)
  if (serializedKeystore !== null) {
    Session.set(`keystore-${userId}`, serializedKeystore)
  }
  // }
  // using lightwallet to deserialize the keystore
  if (serializedKeystore !== null) {
    // keystore = paratii.eth.wallet.decrypt(serializedKeystore)
    const keystore = serializedKeystore
    return keystore
  }
  return null
}

function deleteKeystore (userId) {
  RLocalStorage.removeItem(`keystore-${userId}`)
}

export function keystoresCheck () {
  let keystores = {}
  keystores.users = 0
  keystores.anonymous = 0
  const storageList = Object.keys(window.localStorage)
  storageList.some(function (element) {
    if (element.indexOf('keystore') >= 0 && element.indexOf('keystore-anonymous') < 0) {
      keystores.users++
    }
    if (element.indexOf('keystore-anonymous') >= 0) {
      keystores.anonymous++
    }
  })
  return keystores
}

// returns the seed of the keystore
export function getSeed (password, callback) {
  const keystore = getKeystore()
  return getSeedFromKeystore(password, keystore, callback)
}

export function getSeedFromKeystore (password, keystore, callback) {
  if (keystore !== null) {
    // seed = keystore.getMnenomic(password).then(function(err, result) { callback(err, result)})
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
  const userId = Meteor.userId()
  return createKeystore(password, seedPhrase, userId, cb)
}

function sendTransaction (password, contractName, functionName, args, value, callback) {
  if (!value) {
    value = 0
  }
  if (!args) {
    args = []
  }
  console.log(`Sending transaction: ${contractName}.${functionName}(${args}), with value ${value} ETH`)
  // paratii.personal.wallet.address
  const fromAddr = getUserPTIAddress()
  const nonce = paratii.eth.web3.eth.getTransactionCount(fromAddr)
  const keystore = getKeystore()
  keystore.keyFromPassword(password, async function (error, pwDerivedKey) {
    let contract
    if (error) throw error
    // sign the transaction
    const txOptions = {
      nonce: paratii.eth.web3.utils.toHex(nonce),
      gasPrice: paratii.eth.web3.utils.toHex(GAS_PRICE),
      gasLimit: paratii.eth.web3.utils.toHex(GAS_LIMIT)
    }

    let rawTx
    contract = await paratii.eth.getContract(contractName)
    txOptions.to = contract.address
    txOptions.value = paratii.eth.web3.utils.toHex(value)
    rawTx = lightwallet.txutils.functionTx(contract.abi, functionName, args, txOptions)
    console.log('Signing transaction')
    // console.log(fromAddr)
    const tx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr)
    paratii.eth.web3.eth.sendRawTransaction(`0x${tx}`, function (err, hash) {
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

export { mergeOrCreateNewWallet, deleteKeystore, createKeystore, restoreWallet, sendTransaction, saveKeystore, createAnonymousKeystoreIfNotExists }
