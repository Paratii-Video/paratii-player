import { web3 } from '/imports/lib/ethereum/connection.js';
import { Template } from 'meteor/templating';
import { getUserPTIaddress } from '/imports/api/users.js';
import './debug.html';


export function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
  for (let i = startBlockNumber; i <= endBlockNumber; i += 1) {
    console.log(`Searching block ${i}`);
    const block = web3.eth.getBlock(i);
    if (block != null && block.transactions != null) {
      block.transactions.forEach(function (e) {
        const transaction = web3.eth.getTransaction(e);
        if (myaccount === '*' || myaccount === transaction.from || myaccount === transaction.to) {
          console.log(transaction);
        }
      });
    }
  }
}

Template.debug.events({
  'click #get-transaction-console'() {
    getTransactionsByAccount(getUserPTIaddress(), 0, 55);
  },
});
Template.debug.helpers({
  accounts() {
    return EthAccounts.find();
  },
  eth_host() {
    return Session.get('eth_host');
  },
  eth_isConnected() {
    return Session.get('eth_isConnected');
  },
  eth_currentBlock() {
    return Session.get('eth_currentBlock');
  },
  ptiAddress() {
    return getUserPTIaddress();
  },
  eth_balance() {
    const balance = Session.get('eth_balance');
    if (balance !== undefined) {
      return web3.fromWei(balance, 'ether');
    }
    return '';
  },
  // user() {
  //  return Meteor.user();
  // },
});
