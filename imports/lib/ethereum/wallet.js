/* eslint no-console: "off" */
/* eslint no-prompt: "off" */
/* eslint no-alert: "off" */
/* eslint max-len: "off" */
/* eslint no-param-reassign: "off" */
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { add0x } from '/imports/lib/utils.js';
import { getUserPTIAddress } from '/imports/api/users.js';
import { web3, GAS_PRICE, GAS_LIMIT } from './connection.js';

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
    RLocalStorage.setItem('keystore', keystore.serialize());
    Session.set('keystore', keystore.serialize());

    // while we are at it, also generate an address for our user
    keystore.keyFromPassword(password, function (error, pwDerivedKey) {
      if (error) {
        throw error;
      }
      // generate one new address/private key pairs
      // the corresponding private keys are also encrypted
      keystore.generateNewAddress(pwDerivedKey, 1);
      const address = keystore.getAddresses()[0];
      Session.set('userPTIAddress', address);
      // TODO: we do not seem to be using this anymore...
      Meteor.call('users.update', { 'profile.ptiAddress': address });
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
    Session.set('userPTIAddress', address);
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

function sendParatii(amount, recipient) {
  alert(`sending ${amount} Paratii to ${recipient}`);
}

function sendEther(amountInEth, recipient, password) {
  const fromAddr = getUserPTIAddress();
  const nonce = web3.eth.getTransactionCount(fromAddr);
  const value = parseInt(web3.toWei(amountInEth, 'ether'), 10);

  const keystore = getKeystore();
  keystore.keyFromPassword(password, function (error, pwDerivedKey) {
    if (error) throw error;
    // sign the transaction
    let rawTx = {
      nonce: web3.toHex(nonce),
      to: add0x(recipient),
      value: web3.toHex(value),
      gasPrice: web3.toHex(GAS_PRICE),
      gasLimit: web3.toHex(GAS_LIMIT),
    };
    rawTx = lightwallet.txutils.valueTx(rawTx);
    const tx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr);
    web3.eth.sendRawTransaction(`0x${tx}`, function (err, hash) {
      if (!err) {
        Modal.hide('sendEth');
        console.log(hash); // "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385"
      } else {
        console.log(err);
      }
    });
  });
}

export { createKeystore, restoreWallet, sendParatii, getSeed, sendEther, getPTIBalance };

// ////////////////////
// / Copies from lightwallet, ignore..
// //////////////

// import Web3 from 'web3';
//      var web3 = new Web3();
//       var global_keystore;

//       function setWeb3Provider(keystore) {
//   // TODO: HookedWeb3Provider is deprecated: https://github.com/ConsenSys/hooked-web3-provider
//         var web3Provider = new HookedWeb3Provider({
//           host: "http://104.236.65.136:8545",
//           transaction_signer: keystore
//         });
//         web3.setProvider(web3Provider);
//       }

//       function newAddresses(password) {

//         if (password == '') {
//           password = prompt('Enter password to retrieve addresses', 'Password');
//         }

//         var numAddr = parseInt(document.getElementById('numAddr').value)

//         lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

//         global_keystore.generateNewAddress(pwDerivedKey, numAddr);

//         var addresses = global_keystore.getAddresses();

//         document.getElementById('sendFrom').innerHTML = ''
//         document.getElementById('functionCaller').innerHTML = ''
//         for (var i=0; i<addresses.length; ++i) {
//           document.getElementById('sendFrom').innerHTML += '<option value="' + addresses[i] + '">' + addresses[i] + '</option>'
//           document.getElementById('functionCaller').innerHTML += '<option value="' + addresses[i] + '">' + addresses[i] + '</option>'
//         }
// import Web3 from 'web3';
//      var web3 = new Web3();
//       var global_keystore;

//       function setWeb3Provider(keystore) {
//         // TODO: HookedWeb3Provider is deprecated: https://github.com/ConsenSys/hooked-web3-provider
//         var web3Provider = new HookedWeb3Provider({
//           host: "http://104.236.65.136:8545",
//           transaction_signer: keystore
//         });
//         web3.setProvider(web3Provider);
//       }

//       function newAddresses(password) {

//         if (password == '') {
//           password = prompt('Enter password to retrieve addresses', 'Password');
//         }

//         var numAddr = parseInt(document.getElementById('numAddr').value)

//         lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

//         global_keystore.generateNewAddress(pwDerivedKey, numAddr);

//         var addresses = global_keystore.getAddresses();


//         getBalances();
//       })
//       }

//       function getBalances() {

//         var addresses = global_keystore.getAddresses();
//         document.getElementById('addr').innerHTML = 'Retrieving addresses...'

//         async.map(addresses, web3.eth.getBalance, function(err, balances) {
//           async.map(addresses, web3.eth.getTransactionCount, function(err, nonces) {
//             document.getElementById('addr').innerHTML = ''
//             for (var i=0; i<addresses.length; ++i) {
//               document.getElementById('addr').innerHTML += '<div>' + addresses[i] + ' (Bal: ' + (balances[i] / 1.0e18) + ' ETH, Nonce: ' + nonces[i] + ')' + '</div>'
//             }
//           })
//         })

//       }

//       function setSeed() {
//         var password = prompt('Enter Password to encrypt your seed', 'Password');

//         lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

//         global_keystore = new lightwallet.keystore(
//           document.getElementById('seed').value,
//           pwDerivedKey);

//         document.getElementById('seed').value = ''

//         newAddresses(password);
//         setWeb3Provider(global_keystore);

//         getBalances();
//         })
//       }

//       function newWallet() {
//         var extraEntropy = document.getElementById('userEntropy').value;
//         document.getElementById('userEntropy').value = '';
//         var randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);

//         var infoString = 'Your new wallet seed is: "' + randomSeed +
//           '". Please write it down on paper or in a password manager, you will need it to access your wallet. Do not let anyone see this seed or they can take your Ether. ' +
//           'Please enter a password to encrypt your seed while in the browser.'
//         var password = prompt(infoString, 'Password');

//         lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {

//         global_keystore = new lightwallet.keystore(
//           randomSeed,
//           pwDerivedKey);

//         newAddresses(password);
//         setWeb3Provider(global_keystore);
//         getBalances();
//         })
//       }

//       function showSeed() {
//         var password = prompt('Enter password to show your seed. Do not let anyone else see your seed.', 'Password');

//         lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {
//         var seed = global_keystore.getSeed(pwDerivedKey);
//         alert('Your seed is: "' + seed + '". Please write it down.')
//         })
//       }

//       function sendEth() {
//         var fromAddr = document.getElementById('sendFrom').value
//         var toAddr = document.getElementById('sendTo').value
//         var valueEth = document.getElementById('sendValueAmount').value
//         var value = parseFloat(valueEth)*1.0e18
//         var gasPrice = 50000000000
//         var gas = 50000
//         web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: value, gasPrice: gasPrice, gas: gas}, function (err, txhash) {
//           console.log('error: ' + err)
//           console.log('txhash: ' + txhash)
//         })
//       }

//       function functionCall() {
//         var fromAddr = document.getElementById('functionCaller').value
//         var contractAddr = document.getElementById('contractAddr').value
//         var abi = JSON.parse(document.getElementById('contractAbi').value)
//         var contract = web3.eth.contract(abi).at(contractAddr)
//         var functionName = document.getElementById('functionName').value
//         var args = JSON.parse('[' + document.getElementById('functionArgs').value + ']')
//         var valueEth = document.getElementById('sendValueAmount').value
//         var value = parseFloat(valueEth)*1.0e18
//         var gasPrice = 50000000000
//         var gas = 3141592
//         args.push({from: fromAddr, value: value, gasPrice: gasPrice, gas: gas})
//         var callback = function(err, txhash) {
//           console.log('error: ' + err)
//           console.log('txhash: ' + txhash)
//         }
//         args.push(callback)
//         contract[functionName].apply(this, args)
//       }
