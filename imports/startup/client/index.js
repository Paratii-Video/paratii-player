// Import client startup through a single index entry point


import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

import './routes.js';
// import { web3 } from '../imports/lib/ethereum/web3.js';
import '../../lib/ethereum/web3.js';
import '../../lib/ethereum/walletConnector.js';


// if (typeof web3 !== 'undefined') {
//   web3 = new Web3(web3.currentProvider);
// } else {
//   // set the provider you want from Web3.providers
//   web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
// }

// web3 = new Web3(new Web3.providers.HttpProvider('http://paratii-chain.gerbrandy.com'));
// export default web3;

// Stop app operation, when the node is syncing
web3.eth.isSyncing(function(error, syncing) {
    if(!error) {

        if(syncing === true) {
            console.time('nodeRestarted')
            console.log('Node started syncing, stopping app operation');
            web3.reset(true);

            // clear observers
            _.each(collectionObservers, function(observer) {
                if(observer)
                    observer.stop();
            });
            collectionObservers = [];

        
        } else if(_.isObject(syncing)) {
            
            syncing.progress = Math.floor(((syncing.currentBlock - syncing.startingBlock) / (syncing.highestBlock - syncing.startingBlock)) * 100);
            syncing.blockDiff = numeral(syncing.highestBlock - syncing.currentBlock).format('0,0');

            TemplateVar.setTo('header nav', 'syncing', syncing);
            
        } else {
            console.timeEnd('nodeRestarted')            
            console.log('Restart app operation again');

            TemplateVar.setTo('header nav', 'syncing', false);

            // re-gain app operation
            connectToNode();
        }
    }
});


const connect = function () {
  console.log('Connecting....')
  if (web3.isConnected()) {
    // only start app operation, when the node is not syncing
    // (or the eth_syncing property doesn't exists)
    web3.eth.getSyncing(function (e, sync) {
      if (e || !sync) {
        connectToNode();
      } else {
        EthAccounts.init();
      }
    });
  } else {
        // make sure the modal is rendered after all routes are executed
    Meteor.setTimeout(function () {
            // if in mist, tell to start geth, otherwise start with RPC
      const gethRPC = (web3.admin) ? 'geth' : `geth --rpc --rpccorsdomain "${window.location.protocol}//${window.location.host}"`;

      EthElements.Modal.question({
        text: new Spacebars.SafeString(TAPi18n.__(`wallet.app.texts.connectionError${web3.admin ? 'Mist' : 'Browser'}`,
                    { node: gethRPC })),
        ok() {
          Tracker.afterFlush(function () {
            connect();
          });
        },
      }, {
        closeable: false,
      });
    }, 600);
  }
};

Meteor.startup(function () {
  // delay so we make sure the data is already loaded from the indexedDB
  // TODO improve persistent-minimongo2 ?
  Meteor.setTimeout(function () {
    connect();
  }, 1000);
});
