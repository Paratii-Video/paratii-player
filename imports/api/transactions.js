/* eslint-disable: no-param-reassign */
import { web3, PTIContract } from '/imports/lib/ethereum/connection.js';


if (Meteor.isServer) {
  const Transactions = new Mongo.Collection('transactions');



  Meteor.publish('userTransactions', function (userPTIAddress) {
    check(userPTIAddress, String);
    // Publish all transactions where I find userPTIAddress
    const query = { $or: [{ to: userPTIAddress }, { from: userPTIAddress }] };
    return Transactions.find(query);
  });


  //
  async function addOrUpdateTransaction(transaction) {
      // add (or update) a transaction in the collection
      // TODO: write to collection instead of Session
      // not that this is blocking without a feedback
      check(transaction, {
        description: String,
        from: String,
        to: String,
        ptiValue: Match.Maybe(Number),
        ethValue: Match.Maybe(Number),
        blockNumber: Number,
        transactionHash: String,
      }); // Check the type of the data
      // we track the transactions by transactionHash
      const prevTx = await Transactions.findOne({ transactionHash: transaction.transactionHash });
      if (prevTx) {
        Transactions.update(prevTx._id, { $set: transaction });
      } else {
        Transactions.insert(transaction);
      }
    }

  function addTransferEventToTransactionCollection(log) {
    // TODO: saves transactions in session - should save persistently in meteor collection
    const transaction = {
      description: 'PTI Transaction from Transfer Event',
      from: log.args.from,
      to: log.args.to,
      ptiValue: log.args.value.toNumber(),
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    };
    addOrUpdateTransaction(transaction);
  }


  export function getPTITransactionsFromChain() {
    // set a filter for ALL PTI transactions
    filter = PTIContract().Transfer({}, { fromBlock: 0, toBlock: 'latest' });

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
      fromBlock = 0;
      // console.log(`Using startBlockNumber: ${startBlockNumber}`);
    } else {
      fromBlock = startBlockNumber;
    }
    console.log(myaccount, fromBlock, toBlock);

    for (let i = fromBlock; i <= toBlock; i += 1) {
      web3.eth.getBlock(i, true, function (error, block) {
        if (block != null && block.transactions != null) {
          block.transactions.forEach(function (e) {
            if (myaccount === '*' || myaccount === e.from || myaccount === e.to) {
              addETHTransactionToCollection(e);
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

}
