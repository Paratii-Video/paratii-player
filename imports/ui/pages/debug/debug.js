import { Template } from 'meteor/templating';
import './debug.html';


Template.debug.helpers({
  accounts() {
    return EthAccounts.find();
  },
  ethNode() {
    return Session.get('ethNode');
  },
});
