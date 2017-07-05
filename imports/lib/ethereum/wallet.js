/* eslint no-console: "off" */
/* eslint no-prompt: "off" */
/* eslint no-alert: "off" */
/* eslint max-len: "off" */
/* eslint no-param-reassign: "off" */
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { promisify } from 'promisify-node';
import { getUserPTIaddress } from '/imports/api/users.js';
import { web3 } from './connection.js';

// const promisify = require('promisify-node');

// getKeystore loads the keystore from localstorage
// if such a keystore does not exist, returns undefined
export function getKeystore() {
  keystore = lightwallet.keystore.deserialize(RLocalStorage.getItem('keystore'));
  if (keystore !== undefined) {
    return keystore;
  }

  // const ks = await promisify(lightwallet.keystore.createVault)({ password });
  return undefined;
}

// returns the seed of the keystore
async function getSeed(password) {
  const keystore = await getKeystore(password);
  const pwDerivedKey = await promisify(keystore.deriveKeyFromPassword(password));
  const seed = keystore.getSeed(pwDerivedKey);
  return seed;
}


function createWallet(password, seedPhrase) {
  // TODO: seed have to be generate randomly and returned to the user
  const wallet = {};
  if (seedPhrase == null) {
    seedPhrase = lightwallet.keystore.generateRandomSeed();
  }

  const opts = {
    password,
    seedPhrase,
  };
  console.log(password);
  console.log(seedPhrase);
  lightwallet.keystore.createVault(opts, function (err, keystore) {
    keystore.keyFromPassword(password, function (error, pwDerivedKey) {
      if (error) throw error;
      // generate five new address/private key pairs
      // the corresponding private keys are also encrypted
      keystore.generateNewAddress(pwDerivedKey, 5);
      RLocalStorage.setItem('keystore', keystore.serialize());
      const addr = keystore.getAddresses();
      Meteor.call('users.update', { 'profile.ptiAddress': addr[0] });
      Session.set('seed', seedPhrase);
      // Now set ks as transaction_signer in the hooked web3 provider
      // and you can start using web3 using the keys/addresses in ks!
    });
  });
  // Session.set('keystore', ks);
  // Session.set('ptiAddress', addresses[0]);

  wallet.seed = seedPhrase;
  return wallet;
}

function restoreWallet(password, seedPhrase) {
  return createWallet(password, seedPhrase);
}

function sendParatii(amount, recipient) {
  alert(`sending ${amount} Paratii to ${recipient}`);
}

function sendEther(amountInEth, recipient, password) {
  const fromAddr = getUserPTIaddress();
  const value = parseFloat(amountInEth) * 1.0e18;
  // TODO: set these values in global constansts
  const gasPrice = `0x${50000000000}`; // cost in wei
  // const gas = 50000;
  // create a tx
  const rawTx = lightwallet.txutils.valueTx({
    to: `0x${recipient}`,
    // gasLimit
    gasPrice,
    value: `0x${value}`,
    // nonce
  });
  const keystore = getKeystore();
  keystore.keyFromPassword(password, function (error, pwDerivedKey) {
    if (error) throw error;
    // sign the transaction
    const signedRawTx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr);
    // send the transaction
    web3.eth.sendRawTransaction(signedRawTx, function (err, hash) {
      console.log(err);
      console.log(hash);
    });
  });
}

export { createWallet, restoreWallet, sendParatii, getSeed, sendEther, getPTIBalance };

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
