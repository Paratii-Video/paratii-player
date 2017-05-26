import './web3.js'

const DEFAULT_PROVIDER = 'http://paratii-chain.gerbrandy.com';

function checkStatus() {
    try {
      Session.set('ethNode', {
        host: web3.currentProvider.host,
        isConnected: web3.isConnected(),
        blockNumber: web3.eth.blockNumber,
        error: null,
      });

    }
    catch (e) {
      Session.set('ethNode', {
        host: null,
        isConnected: null,
        error: e,
      })
 
    }
}

// call the status function every second
Meteor.setInterval(checkStatus, 1000);

const connect = function () {
  console.log('Connecting....')
  if (web3.isConnected()) {
    // only start app operation, when the node is not syncing
    // (or the eth_syncing property doesn't exists)
  	EthAccounts.init();
  	EthBlocks.init();
  } 

};

const init = function(){
  web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER));
	connect();
};
