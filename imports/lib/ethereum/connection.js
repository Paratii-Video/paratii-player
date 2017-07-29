/* eslint no-unused-vars: "off" */
import Web3 from 'web3';
import { getUserPTIAddress } from '/imports/api/users.js';
import { deployTestContract } from '/imports/lib/ethereum/wallet.js';
import { abidefinition } from './abidefinition.js';
import { paratiiContract } from './paratiiContract.js';

// TODO: store all this information in a settings.json object
const DEFAULT_PROVIDER = Meteor.settings.public.http_provider;
let PARATII_TOKEN_ADDRESS = '0x385b2e03433c816def636278fb600ecd056b0e8d';
const GAS_PRICE = 50000000000;
const GAS_LIMIT = 4e6;


web3 = new Web3();

export function PTIContract() {
  // return a web3.eth.contract instance for the PTI Contract
  const contract = web3.eth.contract(paratiiContract.abi).at(PARATII_TOKEN_ADDRESS);
  return contract;
}
function getContractAddress() {
  return PARATII_TOKEN_ADDRESS;
}

function setContractAddress(address) {
  PARATII_TOKEN_ADDRESS = address;
  if(Meteor.isClient){
    Session.set('pti_contract_address', PARATII_TOKEN_ADDRESS);
  }
}

function updateSession() {
  /* update Session variables with altest information from the blockchain */
  Session.set('eth_host', web3.currentProvider.host);

  /* if Web3 is running over testrpc test contract is deployed
  and PARATII_TOKEN_ADDRESS ovverride */
  if (web3.currentProvider.host.indexOf('localhost') !== -1) {
    Session.set('isTestRPC', true);
  } else {
    Session.set('isTestRPC', false);
  }

  if (web3.isConnected()) {
    Session.set('eth_isConnected', true);
    Session.set('eth_currentBlock', web3.eth.blockNumber);
    // Session.set('eth_highestBlock', sync.highestBlock);
    const ptiAddress = getUserPTIAddress();
    if (ptiAddress) {
      // SET PTI BALANCE
      const contract = PTIContract();
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

web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER));

export const initConnection = function () {
  Session.set('eth_testContractDeployed', false);
  web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER));

  const filter = web3.eth.filter('latest');
  filter.watch(function (error, result) {
    if (!error) {
      updateSession();
    }
  });
  if (Meteor.isServer) {

    console.log("initConnection");
  }
  // getPTITransactionsFromChain();
  // getTransactionsByAccount('*');
};

export { web3, GAS_PRICE, GAS_LIMIT, getContractAddress, setContractAddress };
