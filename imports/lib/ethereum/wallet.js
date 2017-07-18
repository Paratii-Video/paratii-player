/* eslint no-console: "off" */
/* eslint no-prompt: "off" */
/* eslint no-alert: "off" */
/* eslint max-len: "off" */
/* eslint no-param-reassign: "off" */
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { add0x } from '/imports/lib/utils.js';
import { getUserPTIAddress } from '/imports/api/users.js';
import { web3, GAS_PRICE, GAS_LIMIT, PARATII_TOKEN_ADDRESS } from './connection.js';
import { abidefinition } from './abidefinition.js';

// createKeystore will create a new keystore
// save it in the sesion object and in local storage
// generate an address, and save that in the sesssion too

function createKeystore(password, seedPhrase, cb) {
  // create a new seedPhrase if we have none
  Session.set('generating-keystore', true);
  if (seedPhrase == null) {
    seedPhrase = lightwallet.keystore.generateRandomSeed();
  }
  Session.set('seed', seedPhrase);

  // create a new keystore with the given password and seedPhrase
  const opts = {
    password,
    seedPhrase,
  };
  lightwallet.keystore.createVault(opts, function (err, keystore) {
    if (err) {
      throw err;
    }

    // while we are at it, also generate an address for our user
    keystore.keyFromPassword(password, function (error, pwDerivedKey) {
      if (error) {
        throw error;
      }
      // generate one new address/private key pairs
      // the corresponding private keys are also encrypted
      keystore.generateNewAddress(pwDerivedKey, 1);

      RLocalStorage.setItem('keystore', keystore.serialize());
      Session.set('keystore', keystore.serialize());

      const address = keystore.getAddresses()[0];
      Session.set('userPTIAddress', add0x(address));
      // TODO: we do not seem to be using this anymore...
      Meteor.call('users.update', { 'profile.ptiAddress': add0x(address) });
      Session.set('generating-keystore', false);
      if (cb) {
        cb(error, seedPhrase);
      }
    });
  });
}

// getKeystore tries to load the keystore from the Session,
// or, if it is not found there, restore it from localstorage.
// If no keystore can be found, it returns undefined.
export function getKeystore() {
  let serializedKeystore;
  serializedKeystore = Session.get('keystore');
  if (serializedKeystore === undefined) {
    serializedKeystore = RLocalStorage.getItem('keystore');
    if (serializedKeystore !== null) {
      Session.set('keystore', serializedKeystore);
    }
  }
  // using lightwallet to deserialize the keystore
  if (serializedKeystore !== null) {
    const keystore = lightwallet.keystore.deserialize(serializedKeystore);
    const address = keystore.getAddresses()[0];
    Session.set('userPTIAddress', add0x(address));
    return keystore;
  }
  return null;
}

// returns the seed of the keystore
function getSeed(password, callback) {
  const keystore = getKeystore();
  if (keystore !== null) {
    keystore.keyFromPassword(password, function (err, pwDerivedKey) {
      if (err) {
        Session.set('errorMessage', 'Incorrect password');
        if (callback) {
          callback(err, null);
        }
        return;
      }
      Session.set('errorMessage', null);
      const seed = keystore.getSeed(pwDerivedKey);
      Session.set('seed', seed);
      if (callback) {
        callback(err, seed);
      }
    });
  }
}


function restoreWallet(password, seedPhrase) {
  return createKeystore(password, seedPhrase);
}

function doTx(amount, recipient, password, type) {
  const fromAddr = getUserPTIAddress();
  const nonce = web3.eth.getTransactionCount(fromAddr);
  const value = parseInt(web3.toWei(amount, 'ether'), 10);

  const keystore = getKeystore();
  keystore.keyFromPassword(password, function (error, pwDerivedKey) {
    if (error) throw error;
    // sign the transaction
    const txOptions = {
      nonce: web3.toHex(nonce),
      gasPrice: web3.toHex(GAS_PRICE),
      gasLimit: web3.toHex(GAS_LIMIT),
    };

    switch (type) {
      case 'Eth':
        txOptions.to = add0x(recipient);
        txOptions.value = web3.toHex(value);
        rawTx = lightwallet.txutils.valueTx(txOptions);
        break;
      case 'Pti':
        txOptions.to = PARATII_TOKEN_ADDRESS;
        rawTx = lightwallet.txutils.functionTx(abidefinition, 'transfer', [recipient, value], txOptions);
        // const result = web3.eth.contract(abidefinition).at(PARATII_TOKEN_ADDRESS).transfer(recipient, value);
        // console.log(result);
        // rawTx = lightwallet.txutils.functionTx(abidefinition, 'symbol', [], txOptions);
        break;
      default:

    }
    const tx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr);
    // web3.eth.sign(address, dataToSign, [, callback])
    web3.eth.sendRawTransaction(`0x${tx}`, function (err, hash) {
      if (err) {
        throw err;
      }
      const modalName = `send${type}`;
      Modal.hide(modalName);
      console.log(hash); // "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385"
      const receipt = web3.eth.getTransactionReceipt(hash);
      console.log(receipt);
    });
  });
}

function sendParatii(amountInPti, recipient, password) {
  doTx(amountInPti, recipient, password, 'Pti');
}
function sendEther(amountInEth, recipient, password) {
  doTx(amountInEth, recipient, password, 'Eth');
}

export { createKeystore, restoreWallet, sendParatii, getSeed, sendEther, getPTIBalance };
