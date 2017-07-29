// Server entry point, imports all server code

import '../imports/startup/server';
import '../imports/startup/server/fixtures.js';
import '../imports/startup/both';
import '../imports/api/users.js';
import {getPTITransactionsFromChain, getTransactionsByAccount} from '../imports/api/transactions.js';
import { web3, PTIContract } from '/imports/lib/ethereum/connection.js';

web3 = new Web3();
const DEFAULT_PROVIDER = Meteor.settings.public.http_provider;
const FIRST_BLOCK = 0; // First block we consider when searching for transaction history etc.
Meteor.settings.public.first_block = FIRST_BLOCK;
web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER));

//Launch wath con Transfer event, for PTI transfer
getPTITransactionsFromChain();

//Adding a Job for ETH transaction fetching
SyncedCron.add({
  name: 'Retrieve ETH TX from blockchain',
  schedule(parser) {
    // parser is a later.parse object
    return parser.recur().every(30).second();
  },
  job() {
    getTransactionsByAccount('*');
  }
});

//starting all the added Job
SyncedCron.start();
