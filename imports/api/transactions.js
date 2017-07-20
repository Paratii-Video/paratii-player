/* eslint-disable: no-param-reassign */
import { web3, PTIContract } from '/imports/lib/ethereum/connection.js';

function addOrUpdateTransaction(transaction) {
  // add (or update) a transaction in the collection
  // TODO: write to collection instead of Session
  transactions = Session.get('transactions') || [];
  transactions.push(transaction);
  Session.set('transactions', transactions);
}

function addTransferEventToTransactionCollection(log) {
  // TODO: saves transactions in session - should save persistently in meteor collection
  const transaction = {
    description: 'PTI Transaction from Transfer Event',
    from: log.args._from,
    to: log.args._to,
    ptiValue: log.args._value.toNumber(),
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
  };
  addOrUpdateTransaction(transaction);
}

export function getPTITransactionsFromChain() {
  // set a filter for ALL PTI transactions
  Session.set('transactions', []);
  filter = PTIContract().Transfer({}, { fromBlock: 0, toBlock: 'latest' });
  // filter.get(function (error, logs) {
  //   if (error) {
  //     throw error;
  //   }
  //   for (let i = 0; i < logs.length; i = +1) {
  //     addLogToTransactions(logs[i]);
  //   }
  // });
  filter.watch(function (error, log) {
    if (error) {
      throw error;
    }
    addTransferEventToTransactionCollection(log);
  });
}


function addETHTransactionToCollection(tx) {
  // TODO: saves transactions in session - should save persistently in meteor collection
  const transaction = {
    description: 'ETH transaction from chain',
    from: tx.from,
    to: tx.to,
    ethValue: tx.value.toNumber(),
    blockNumber: tx.blockNumber,
    // datetime: block.timestamp} ${new Date(block.timestamp * 1000).toGMTString()}
    transactionHash: tx.hash,
  };
  addOrUpdateTransaction(transaction);
}

// Itseems the only way to get the ETH transaction is by searching each block separately
// next function adapted from https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
// NB: this is *very expensive* as it makes a request for each block to be searched
export function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
  let fromBlock;
  let toBlock;
  if (endBlockNumber == null) {
    toBlock = web3.eth.blockNumber;
    // console.log(`Using endBlockNumber: ${endBlockNumber}`);
  } else {
    toBlock = endBlockNumber;
  }
  if (startBlockNumber == null) {
    fromBlock = Meteor.settings.public.first_block;
    // console.log(`Using startBlockNumber: ${startBlockNumber}`);
  } else {
    fromBlock = startBlockNumber;
  }
  for (let i = fromBlock; i <= toBlock; i += 1) {
    web3.eth.getBlock(i, true, function (error, block) {
      if (block != null && block.transactions != null) {
        block.transactions.forEach(function (e) {
          if (myaccount === '*' || myaccount === e.from || myaccount === e.to) {
            addETHTransactionToCollection(e);
          //   console.log(`  tx hash          : ${e.hash}\n`
          //     + `   nonce           : ${e.nonce}\n`
          //     + `   blockHash       : ${e.blockHash}\n`
          //     + `   blockNumber     : ${e.blockNumber}\n`
          //     + `   transactionIndex: ${e.transactionIndex}\n`
          //     + `   from            : ${e.from}\n`
          //     + `   to              : ${e.to}\n`
          //     + `   value           : ${e.value}\n`
          //     + `   time            : ${block.timestamp}
              // ${new Date(block.timestamp * 1000).toGMTString()}\
          //     + `   gasPrice        : ${e.gasPrice}\n`
          //     + `   gas             : ${e.gas}\n`
          //     + `   input           : ${e.input}`);
          }
        });
      }
    });
  }
}

export function syncTransactionHistory() {
    // searches the whole blockchain for transactions that may be relevant
    // and saves these as transaction objects

}
