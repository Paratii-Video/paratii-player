import { Template } from 'meteor/templating';
import './debug.html';


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
  eth_blockNumber() {
    return Session.get('eth_blockNumber');
  },
  ptiAddress() {
    return Session.get('ptiAddress');
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
