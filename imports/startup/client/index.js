// Import client startup through a single index entry point


import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

import './routes.js';
import '../../lib/ethereum/web3.js';
import '../../lib/ethereum/wallet.js';
import {connection } from  '../../lib/ethereum/connection.js';



Meteor.startup(function () {
  // delay so we make sure the data is already loaded from the indexedDB
  // TODO improve persistent-minimongo2 ?
  Meteor.setTimeout(function () {
      // connection.init();
  }, 1000);
});
