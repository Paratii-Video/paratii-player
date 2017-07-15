/* eslint no-unused-vars: "off" */
import Web3 from 'web3';
import { getUserPTIAddress } from '/imports/api/users.js';
import { abidefinition } from './abidefinition.js';

const DEFAULT_PROVIDER = Meteor.settings.public.http_provider;
const PARATII_TOKEN_ADDRESS = '0x385b2e03433c816def636278fb600ecd056b0e8d';
const GAS_PRICE = 50000000000;
const GAS_LIMIT = 4e6;

web3 = new Web3();


function updateSession() {
  /* update Session variables with altest information from the blockchain */
  Session.set('eth_host', web3.currentProvider.host);
  if (web3.isConnected()) {
    Session.set('eth_isConnected', true);
    Session.set('eth_currentBlock', web3.eth.blockNumber);
    // Session.set('eth_highestBlock', sync.highestBlock);
    const ptiAddress = getUserPTIAddress();
    if (ptiAddress) {
      // SET PTI BALANCE

      const contract = web3.eth.contract(abidefinition).at(PARATII_TOKEN_ADDRESS);
      const ptiBalance = contract.balanceOf(ptiAddress);
      Session.set('pti_balance', ptiBalance.toNumber());

      // SET ETH BALANCE
      web3.eth.getBalance(ptiAddress, function (err, result) {
        if (result !== undefined) {
          Session.set('eth_balance', result.toNumber());
        }
      });
    }
  } else {
    Session.set('eth_isConnected', false);
    Session.set('eth_currentBlock', null);
    Session.set('eth_highestBlock', null);
    Session.set('eth_balance', null);
    Session.set('pti_balance', null);
  }
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

  // web3.eth.isSyncing(updateSession);
  const filter = web3.eth.filter('latest');
  console.log('filter');
  updateSession();
  filter.watch(function (error, result) {
    console.log(error);
    console.log(result);
    if (!error) {
      updateSession();
    }
  });
};

export { web3, GAS_PRICE, GAS_LIMIT, PARATII_TOKEN_ADDRESS };
