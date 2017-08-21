// Server entry point, imports all server code

import '../imports/startup/server';
import '../imports/startup/server/fixtures.js';
import '../imports/startup/both';
import '../imports/api/users.js';
import { syncTransactionHistory, watchTransactions, getTransactionsByAccount } from '/imports/api/transactions.js';
import { web3, PTIContract, getContractAddress } from '/imports/lib/ethereum/connection.js';

web3 = new Web3();
const DEFAULT_PROVIDER = Meteor.settings.public.http_provider;
const FIRST_BLOCK = 0; // First block we consider when searching for transaction history etc.
Meteor.settings.public.first_block = FIRST_BLOCK;
web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER));


Meteor.startup(function() {
  // sync the transaction history - update the collection to include the latest blocks
  getTransactionsByAccount('*');
  // now keep watching for blocks
  watchTransactions();
});
