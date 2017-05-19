import { Template } from 'meteor/templating';
import './debug.html';


Template.debug.helpers({
  accounts() {
    return EthAccounts.find();
  },
  // web3() {
  //   return web3;
  // },
});
