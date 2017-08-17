/* eslint no-console: "off" */
/* eslint no-prompt: "off" */
/* eslint no-alert: "off" */
/* eslint max-len: "off" */
/* eslint no-param-reassign: "off" */
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import lightwallet from 'eth-lightwallet/dist/lightwallet.js';
import { Accounts } from 'meteor/accounts-base';
import { add0x } from '/imports/lib/utils.js';
import { getUserPTIAddress } from '/imports/api/users.js';
import { web3, GAS_PRICE, GAS_LIMIT, getContractAddress, setContractAddress } from './connection.js';
import { paratiiContract } from './paratiiContract.js';
import { resetPTIFilter } from '/imports/api/transactions.js';


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
      cb(err)
      return;
    }

    // while we are at it, also generate an address for our user
    keystore.keyFromPassword(password, function (error, pwDerivedKey) {
      if (error) {
        cb(error)
        return;
      }
      // generate one new address/private key pairs
      // the corresponding private keys are also encrypted
      keystore.generateNewAddress(pwDerivedKey, 1);

      RLocalStorage.setItem(`keystore-${Accounts.userId()}`, keystore.serialize());
      Session.set(`keystore-${Accounts.userId()}`, keystore.serialize());

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
  serializedKeystore = Session.get(`keystore-${Accounts.userId()}`);
  if (serializedKeystore === undefined) {
    serializedKeystore = RLocalStorage.getItem(`keystore-${Accounts.userId()}`);
    if (serializedKeystore !== null) {
      Session.set(`keystore-${Accounts.userId()}`, serializedKeystore);
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


function restoreWallet(password, seedPhrase, cb) {
  return createKeystore(password, seedPhrase, cb);
}

function doTx(amount, recipient, password, type, description) {
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
        txOptions.type = 'eth';
        rawTx = lightwallet.txutils.valueTx(txOptions);
        break;
      case 'PTI':
        txOptions.to = getContractAddress();
        txOptions.type = 'pti';
        rawTx = lightwallet.txutils.functionTx(paratiiContract.abi, 'transfer', [recipient, value], txOptions);
        break;
      default:

    }
    const tx = lightwallet.signing.signTx(keystore, pwDerivedKey, rawTx, fromAddr);
    web3.eth.sendRawTransaction(`0x${tx}`, function (err, hash) {
      if (err) {
        throw err;
      }
      console.log(hash); // "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385"
      const receipt = web3.eth.getTransactionReceipt(hash);
      txOptions.from = fromAddr;
      txOptions.description = description;
      Meteor.call('addTXToCollection', txOptions);

      console.log(receipt);
    });
  });
}

function sendUnSignedTransaction(address, amount) {
  const toAddr = getUserPTIAddress();
  web3.eth.sendTransaction({ from: add0x(address), to: add0x(toAddr), value: web3.toWei(amount, 'ether'), gasLimit: 21000, gasPrice: 20000000000 });
}

function sendUnSignedContractTransaction(address, value) {
  const contractAddress = getContractAddress();
  const toAddr = getUserPTIAddress();
  const contract = web3.eth.contract(paratiiContract.abi).at(contractAddress);
  contract.transfer(toAddr, web3.toWei(value, 'ether'), { gas: 200000, from: address });
}

function getAccounts() {
  return web3.eth.accounts;
}

function sendPTI(amountInPti, recipient, password) {
  doTx(amountInPti, recipient, password, 'PT');
}
function sendEther(amountInEth, recipient, password) {
  doTx(amountInEth, recipient, password, 'Eth');
}

function deployTestContract(owner) {
  const MyContract = web3.eth.contract(paratiiContract.abi);
  MyContract.new(
    {
      from: add0x(owner),
      data: paratiiContract.unlinked_binary,
      gas: web3.toHex(GAS_LIMIT),
    }, function (err, myContract) {
    console.log(err);
    if (!err) {
       // NOTE: The callback will fire twice!
       // Once the contract has the transactionHash property set and once its deployed on an address.

       // e.g. check tx hash on the first call (transaction send)
      if (!myContract.address) {
        console.log(myContract.transactionHash); // The hash of the transaction, which deploys the contract

       // check address on the second call (contract deployed)
      } else {
        setContractAddress(myContract.address);
        Meteor.call('resetFilter', {
          contract: myContract.address
        });
        console.log(myContract.address); // the contract address
      }

       // Note that the returned "myContractReturned" === "myContract",
       // so the returned "myContractReturned" object will also get the address set.
    }
  });
}


export { createKeystore, restoreWallet, doTx, sendPTI, getSeed, sendEther, getPTIBalance, getAccounts, sendUnSignedTransaction, deployTestContract, sendUnSignedContractTransaction };
