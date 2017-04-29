import './web3.js'

const DEFAULT_PROVIDER = 'http://paratii-chain.gerbrandy.com';

function status() {
    try {
        Session.set('connected',web3.isConnected())
    }
    catch (e) {
        Session.set('connected',false)
    }
}
//Call the status function every second
// Meteor.setInterval(status, 1000);

setProvider = function(url) {
	web3.setProvider(new web3.providers.HttpProvider(url));
  	Session.set("host", web3.currentProvider.host);
}


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
	setProvider(DEFAULT_PROVIDER);
	connect();
};

