import { Template } from 'meteor/templating';
import { web3 } from '/imports/lib/ethereum/web3.js';
import './debug.html';


Template.debug.helpers({
  accounts() {
    return EthAccounts.find();
  },
  // web3() {
  //   return web3;
  // },
});
