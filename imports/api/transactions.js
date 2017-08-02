/* eslint-disable: no-param-reassign */
import { web3, PTIContract, setContractAddress } from '/imports/lib/ethereum/connection.js';


if (Meteor.isServer) {
  const Transactions = new Mongo.Collection('transactions');
  let PTIFilter;

  Meteor.methods({
    'resetFilter'(data) {
      check(data, Object);
      console.log('resettingFilter');
      resetPTIFilter(data.contract);
    },
    'addTXToCollection'(data){
      check(data,Object);
      const transaction = {
        nonce: data.nonce,
        from: data.from,
        to: data.to,
        description: data.description,
        valid : false,
        type: data.type
      };
      addOrUpdateTransaction(transaction);
    }
  });


  Meteor.publish('userTransactions', function (userPTIAddress) {
    check(userPTIAddress, String);
    // Publish all transactions where I find userPTIAddress
    const query = {$and : [{ $or : [ { to: userPTIAddress }, { from: userPTIAddress } ] },{ valid : true }]};
    return Transactions.find(query);
  });


  //
  async function addOrUpdateTransaction(transaction) {
    // add (or update) a transaction in the collection
    // TODO: write to collection instead of Session
    // not that this is blocking without a feedback
    check(transaction, Object); // Check the type of the data
    // we track the transactions by transactionHash

    // Selftransactions are filtered
    if(transaction.to == transaction.from){
      return;
    }

    const txToValidate = await Transactions.findOne({ nonce: transaction.nonce, from:transaction.from });
    if (txToValidate) {
      // console.log('update'+ transaction.hash);

      Transactions.update(txToValidate._id, { $set: {
          valid: true,
          value: transaction.value,
        }
      });

    } else {
      transaction.valid = true;
      Transactions.insert(transaction);
    }
  }



  export function resetPTIFilter(contract){

    PTIFilter.stopWatching();
    setContractAddress(contract);
    getPTITransactionsFromChain();
  }


  export async function getPTITransactionsFromChain() {
    // set a filter for ALL PTI transactions
    PTIFilter = PTIContract().Transfer({}, { fromBlock: 0, toBlock: 'latest' });

    PTIFilter.watch(function (error, log) {
      if (error) {
        throw error;
      }
      // console.log(log);
      addTransferEventToTransactionCollection(log);
    });
  }

  function addTransferEventToTransactionCollection(log) {
    // TODO: saves transactions in session - should save persistently in meteor collection

    // log.value = log.value.toNumber();
    const tx = web3.eth.getTransaction(log.transactionHash);
    const transaction = {};
    transaction.value = log.args.value.toNumber();
    transaction.from = log.args.from;
    transaction.nonce = tx.nonce;
    transaction.hash = tx.hash;
    transaction.blockNumber = tx.blockNumber;
    transaction.to = log.args.to;
    transaction.type = "pti";
    console.log(transaction);
    addOrUpdateTransaction(transaction);
  }

  function addTransactionToCollection(tx) {

    const receipt = web3.eth.getTransactionReceipt(tx.hash);

    if(receipt.logs.length == 0 && tx.value.toNumber() != 0){
      const transaction = {};

      transaction.value = tx.value.toNumber();
      transaction.from = tx.from;
      transaction.to = tx.to;
      transaction.hash = tx.hash;
      transaction.nonce = tx.nonce;
      transaction.blockNumber = tx.blockNumber;
      transaction.type = "eth";
      console.log(transaction);
      addOrUpdateTransaction(transaction);
    }
    //
  }

  // Itseems the only way to get the ETH transaction is by searching each block separately
  // next function adapted from https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
  // NB: this is *very expensive* as it makes a request for each block to be searched
  export async function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
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

    for (let i = fromBlock; i <= toBlock; i += 1) {
      web3.eth.getBlock(i, true, function (error, block) {
        if (block != null && block.transactions != null) {
          block.transactions.forEach(function (transaction) {
            if (myaccount === '*' || myaccount === transaction.from || myaccount === transaction.to) {
              // console.log(web3.eth.getTransaction(transaction.hash));
              addTransactionToCollection(web3.eth.getTransaction(transaction.hash));
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
