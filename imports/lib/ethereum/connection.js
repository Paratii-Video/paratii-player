import './web3.js';
import { getUserPTIaddress } from '../../api/users.js';
const DEFAULT_PROVIDER = 'http://paratii-chain.gerbrandy.com';

function checkStatus() {
  if (web3.isConnected()) {
    Session.set('eth_isConnected', true);
    Session.set('eth_host', web3.currentProvider.host);
    web3.eth.getBlockNumber(function (err, result) {
      Session.set('eth_blockNumber', result);
    });
    const ptiAddress = getUserPTIaddress();
    if (ptiAddress) {
      web3.eth.getBalance(ptiAddress, function (err, result) {
        Session.set('eth_balance', result.toNumber());
      });
    }
  } else {
    Session.set('eth_host', web3.currentProvider.host);
    Session.set('eth_isConnected', false);
    Session.set('eth_blockNumber', '');
    Session.set('eth_balance', '');
  }
}

  };
}

const connect = function () {
  if (web3.isConnected()) {
    // only start app operation, when the node is not syncing
    // (or the eth_syncing property doesn't exists)
    EthAccounts.init();
    EthBlocks.init();
  }
};

export const initConnection = function () {
  web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER));
  // connect();
  // call the status function every second
  Meteor.setInterval(checkStatus, 1000);
};
