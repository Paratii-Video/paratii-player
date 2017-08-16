import {
  web3,
  PTIContract,
  setContractAddress
} from '/imports/lib/ethereum/connection.js';
import { Videos } from '/imports/api/videos.js';

export const Transactions = new Mongo.Collection('transactions');


if (Meteor.isServer) {

  Meteor.methods({
    'addTXToCollection' (data, options) {
      check(data, Object);
      const transaction = {
        nonce: web3.toDecimal(data.nonce),
        from: data.from,
        to: data.to,
        description: data.description,
        type: data.type
      };
      Object.assign(transaction, options); // If there are options they are merged in the transation object
      addOrUpdateTransaction(transaction);
    }
  });

  Meteor.publish('userTransactions', function(userPTIAddress) {
    check(userPTIAddress, String);
    // Publish all transactions where I find userPTIAddress
    const query = {
      $and: [{
        $or: [{
          to: userPTIAddress
        }, {
          from: userPTIAddress
        }]
      }, {
        valid: true
      }]
    };
    return Transactions.find(query);
  });
}

async function addOrUpdateTransaction(transaction) {
  // add (or update) a transaction in the collection
  check(transaction, Object); // Check the type of the data

  // Selftransactions are filtered
  if (transaction.to == transaction.from) {
    return;
  }

  const txToUpdate = await Transactions.findOne({
    nonce: transaction.nonce,
    from: transaction.from
  });
/*
  var videoId;
  if(txToUpdate){
    videoId = txToUpdate.videoid;
  } else {
    videoId = transaction.videoid;
  }

  if(videoId){
    const video = Videos.findOne({_id:videoId});

    console.log('trans: '+transaction.value);
    console.log('video: '+web3.toWei(video.price, 'ether'));
    if (parseInt(web3.toWei(video.price, 'ether'), 10) !== transaction.value ){
      console.log('prices not match');
      transaction.valid = false;
    }
  }

*/
  console.log('txToUpdate: ');
  console.log(txToUpdate);
  console.log('transaction: ');
  console.log(transaction);

  txToUpdate ? await Transactions.update({_id: txToUpdate._id}, {$set: transaction })  : await Transactions.insert(transaction);

}

async function getPTITransactionsFromChain(fromBlock = 0) {
  // set a filter for ALL PTI transactions
  filter = PTIContract().Transfer({}, {
    fromBlock,
    toBlock: 'latest'
  });

  filter.watch(function(error, log) {
    if (error) {
      throw error;
    }
    addTransferEventToTransactionCollection(log);
  });
}

function addTransferEventToTransactionCollection(log) {
  const tx = web3.eth.getTransaction(log.transactionHash);
  const transaction = {};
  transaction.value = log.args.value.toNumber();
  transaction.from = log.args.from;
  transaction.nonce = tx.nonce;
  transaction.hash = tx.hash;
  transaction.blockNumber = tx.blockNumber;
  transaction.to = log.args.to;
  transaction.valid = true;
  transaction.type = "pti";
  addOrUpdateTransaction(transaction);
}

function addTransactionToCollection(tx) {
  const receipt = web3.eth.getTransactionReceipt(tx.hash);
  if (receipt.logs.length == 0 && tx.value.toNumber() != 0) {
    const transaction = {};
    transaction.value = tx.value.toNumber();
    transaction.from = tx.from;
    transaction.to = tx.to;
    transaction.hash = tx.hash;
    transaction.nonce = tx.nonce;
    transaction.blockNumber = tx.blockNumber;
    transaction.valid = true;
    transaction.type = "eth";
    addOrUpdateTransaction(transaction);
  }
}

// Itseems the only way to get the ETH transaction is by searching each block separately
// next function adapted from https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
// NB: this is *very expensive* as it makes a request for each block to be searched
async function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
  let fromBlock;
  let toBlock;
  if (endBlockNumber == null) {
    toBlock = web3.eth.blockNumber;
  } else {
    toBlock = endBlockNumber;
  }
  if (startBlockNumber == null) {
    fromBlock = 0;
  } else {
    fromBlock = startBlockNumber;
  }

  for (let i = fromBlock; i <= toBlock; i += 1) {
    web3.eth.getBlock(i, true, function(error, block) {
      if (block != null && block.transactions != null) {
        block.transactions.forEach(function(transaction) {
          if (myaccount === '*' || myaccount === transaction.from || myaccount === transaction.to) {
            addTransactionToCollection(web3.eth.getTransaction(transaction.hash));
          }
        });
      }
    });
  }
};

async function syncTransactionHistory() {
  // searches the whole blockchain for transactions that may be relevant
  // and saves these in the Transaction collection
  const transactionsCount = await Transactions.find().count();
  if (transactionsCount > 0) {
    // the highest known blocknumber in the Transaction Collection
    latestSyncedBlock = Transactions.findOne({}, {
      sort: {
        blockNumber: -1,
        limit: 1
      }
    }).blockNumber;
  } else {
    let latestSyncedBlock = 0;
  }
  getTransactionsByAccount('*', fromBlock = latestSyncedBlock);
  getPTITransactionsFromChain(fromBlock = latestSyncedBlock);
};



function watchTransactions() {

  web3.eth.filter('latest', function(error, result) {
    syncTransactionHistory();
  });
};



export {
  getTransactionsByAccount,
  watchTransactions,
  syncTransactionHistory
};
