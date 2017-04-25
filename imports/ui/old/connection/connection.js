import { Template } from 'meteor/templating';
import { web3 } from '/imports/lib/ethereum/web3.js';
import './connection.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
});


Template.connection.helpers({
  accounts() {
    return EthAccounts.find();
  },
  web3() {
    return web3;
  },
});
