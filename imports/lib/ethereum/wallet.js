/* eslint no-console: "off" */
/* eslint no-prompt: "off" */
/* eslint no-alert: "off" */
/* eslint max-len: "off" */
/* eslint no-param-reassign: "off" */

import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { getUserPTIaddress } from '/imports/api/users.js';
import { web3 } from './connection.js';

let globalKeystore;


function getKeystore(callback) {
  if (globalKeystore !== undefined) {
    callback(null, globalKeystore);
  } else {
    const password = prompt('Enter password to show your seed. Do not let anyone else see your seed.', 'password');

    lightwallet.keystore.createVault(
      {
        password,
      },
      function (err, ks) {
        callback(err, ks, password);
      },
    );
  }
}

function getSeed(callback) {
  getKeystore(function (err, ks, password) {
    console.log(password);
    console.log(err);
    ks.deriveKeyFromPassword(password, function (err2, pwDerivedKey) {
      if (err2) {
        throw err2;
      }
      console.log(pwDerivedKey);
      const seed = ks.getSeed(pwDerivedKey);
      callback(err2, seed);
    });
  });
}

function createWallet(password, seedPhrase, cb) {
  const wallet = {};

  if (seedPhrase === undefined) {
    seedPhrase = lightwallet.keystore.generateRandomSeed();
  }
  lightwallet.keystore.createVault({
    password,
    seedPhrase,
    // salt: fixture.salt,     // Optionally provide a salt.
                               // A unique salt will be generated otherwise.
    // hdPathString: hdPath    // Optional custom HD Path String
  }, function (err, ks) {
    if (err) throw err;
    globalKeystore = ks;
    // Some methods will require providing the `pwDerivedKey`,
    // Allowing you to only decrypt private keys on an as-needed basis.
    // You can generate that value with this convenient method:
    ks.keyFromPassword(password, function (err2, pwDerivedKey) {
      if (err2) throw err2;

        // generate five new address/private key pairs
        // the corresponding private keys are also encrypted
      ks.generateNewAddress(pwDerivedKey, 5);
      const addresses = ks.getAddresses();
      Session.set('keystore', ks);
      Session.set('ptiAddress', addresses[0]);
      Meteor.call('users.update', { 'profile.ptiAddress': addresses[0] });

      // Meteor.users.update(Meteor.userId(),
      //   { $set:  });

      ks.passwordProvider = function (callback) {
        const pw = prompt('Please enter password', 'Password');
        callback(null, pw);
      };
      // Now set ks as transaction_signer in the hooked web3 provider
      // and you can start using web3 using the keys/addresses in ks!
      // var web3Provider = new HookedWeb3Provider({
      //   host: "http://04.236.65.136:8545",
      //   transaction_signer: keystore
      // });
      // web3.setProvider(web3Provider);
      if (cb) {
        cb(ks);
      }
    });
  });
  wallet.seed = seedPhrase;
  return wallet;
}

function restoreWallet(password, seedPhrase) {
  return createWallet(password, seedPhrase);
}

function sendParatii(amount, recipient) {
  alert(`sending ${amount} Paratii to ${recipient}`);
}

function sendEther(amountInEth, recipient) {
  const fromAddr = getUserPTIaddress();
  const value = parseFloat(amountInEth) * 1.0e18;
  // TODO: set these values in global constansts
  const gasPrice = 50000000000; // cost in wei
  // const gas = 50000;
  // create a tx
  const rawTx = lightwallet.txUtils.valueTx({
    to: recipient,
    // gasLimit
    gasPrice,
    value,
    // nonce
  });

  // sign the transaction
  const signedRawTx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr);

  // send the transaction
  web3.eth.sendRawTransaction(signedRawTx);
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
