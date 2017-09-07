/* globals ReactiveAggregate */
import {
  web3,
  PTIContract
} from '/imports/lib/ethereum/connection.js'

export const Transactions = new Mongo.Collection('transactions')
export const UserTransactions = new Mongo.Collection('userTransactions')

if (Meteor.isServer) {
  Meteor.methods({
    'addTXToCollection' (data, options) {
      check(data, Object)
      const transaction = {
        nonce: web3.toDecimal(data.nonce),
        from: data.from,
        to: data.to,
        description: data.description,
        source: 'client',
        value: data.value,
        currency: data.currency,
        date: new Date()
      }

      Object.assign(transaction, options) // If there are options they are merged in the transation object
      console.log('Inserting Transaction from  Client application', transaction)
      addOrUpdateTransaction(transaction)
    }
  })

  Meteor.publish('userTransactions', function (userPTIAddress) {
    check(userPTIAddress, String)

    // Publish all transactions where I find userPTIAddress and blockNumber exist
    const query = {
      $or: [{
        to: userPTIAddress
      }, {
        from: userPTIAddress
      }]
      // blockNumber: {$ne: null}
    }

    // Aggregate transactions with same hash as ID and group data
    // new collections userTransactions will be publish with this structures
    ReactiveAggregate(this, Transactions, [
      { $match: query },
      { $group: {
        _id: '$hash',
        blockNumber: {$last: '$blockNumber'},
        source: {$push: '$source'},
        from: {$first: '$from'},
        to: {$first: '$to'},
        currency: {$first: '$currency'},
        description: {$first: '$description'},
        value: {$first: '$value'},
        // transactions: { $push: "$$ROOT" }
        videoid: { $push: '$videoid' },
        data: {$push: '$date'}
      }
      }
    ],
      {clientCollection: 'userTransactions'})
  })
}

async function addOrUpdateTransaction (transaction) {
  // add (or update) a transaction in the collection
  check(transaction, Object) // Check the type of the data

  // if the transaction has a hash value, we use that as its identifier
  let existingTransaction
  if (transaction.hash) {
    existingTransaction = await Transactions.findOne({
      hash: transaction.hash
    })
  } else {
    existingTransaction = await Transactions.findOne({
      nonce: transaction.nonce,
      from: transaction.from,
      source: transaction.source
    })
  }

  let txId
  if (existingTransaction) {
    console.log('Transaction already exists  - not added')
    txId = existingTransaction._id
  } else {
    console.log('Added transaction')
    txId = Transactions.insert(transaction)
  }
  return txId

  // const txToValidate = await Transactions.findOne({
  //   blockNumber: null,
  //   nonce: transaction.nonce,
  //   from: transaction.from,
  //   source: 'client'
  // })
  //
  // if (txToValidate) {
  //   Transactions.update({_id: txToValidate._id}, { $set: { blockNumber: transaction.blockNumber, hash: transaction.hash } })
  // } else {
  //   const txValidated = await Transactions.findOne({
  //     blockNumber: {$ne: null},
  //     nonce: transaction.nonce,
  //     from: transaction.from,
  //     source: {$ne: 'client'}
  //   })
  //   if (txValidated) {
  //     Transactions.update({ _id: newTxId }, { $set: { blockNumber: txValidated.blockNumber, hash: txValidated.hash } })
  //   }
  // }
}

async function syncTransactions () {
  // syncs all transactions in the blockchain that are not in the database yet
  let fromBlock
  let toBlock
  fromBlock = (await getLatestSyncedBlockNumber()) + 1
  toBlock = web3.eth.blockNumber
  syncPTITransactions(fromBlock, toBlock)
  syncETHTransactions(fromBlock, toBlock)
}

async function syncPTITransactions (fromBlock = 0, toBlock) {
  // set a filter for ALL PTI transactions
  console.log('PTI SYNC FROM', fromBlock, 'TO', toBlock)
  let filter = PTIContract().Transfer({}, {
    fromBlock,
    toBlock
  })

  filter.get(function (error, logs) {
    if (error) {
      throw error
    }
    logs.forEach(function (log) {
      addPTITransaction(log)
    })
  })
}

// Itseems the only way to get the ETH transaction is by searching each block separately
// next function adapted from https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
// NB: this is *very expensive* as it makes a request for each block to be searched
async function syncETHTransactions (fromBlock, toBlock) {
  console.log('ETH SYNC FROM', fromBlock, 'TO', toBlock)
  for (let i = fromBlock; i <= toBlock; i += 1) {
    syncBlockWithDB(i)
  }
};

async function syncBlockWithDB (blockHashOrNumber) {
  // get the block given blockHashOrNumber, find its transactions and write them to the DB
  web3.eth.getBlock(blockHashOrNumber, true, function (error, block) {
    if (error) {
      throw error
    }
    if (block != null && block.transactions != null) {
      block.transactions.forEach(function (transaction) {
        addETHTransaction(web3.eth.getTransaction(transaction.hash))
      })
    }
  })
}

async function watchTransactions () {
  watchPTITransactions()
  watchETHTransactions()
}

function watchETHTransactions () {
  console.log('Watching for ETH Transactions')
  web3.eth.filter('latest', function (error, result) {
    if (error) {
      // TODO: proper error handling
      console.log(error)
      return
    }
    syncBlockWithDB(result)
  })
};

async function watchPTITransactions () {
  // set a filter for ALL PTI transactions
  console.log('Watching for PTI Transactions')
  let filter = PTIContract().Transfer({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  })

  filter.watch(function (error, log) {
    if (error) {
      // TODO: proper error handling
      console.log(error)
      return
    }
    addPTITransaction(log)
  })
}

function addPTITransaction (log) {
  // const tx = web3.eth.getTransaction(log.transactionHash)
  const transaction = {}
  transaction.value = log.args.value.toNumber()
  transaction.from = log.args.from
  transaction.hash = log.topics[0]
  transaction.transactionHash = log.transactionHash
  transaction.blockNumber = log.blockNumber
  transaction.to = log.args.to
  transaction.currency = 'pti'
  transaction.source = 'event'
  console.log('Add event to collection: ', transaction.hash)
  return addOrUpdateTransaction(transaction)
}

function addETHTransaction (tx) {
  if (tx.value.toNumber() > 0) {
    const transaction = {}
    transaction.value = tx.value.toNumber()
    transaction.from = tx.from
    transaction.to = tx.to
    transaction.hash = tx.hash
    transaction.nonce = tx.nonce
    transaction.blockNumber = tx.blockNumber
    transaction.currency = 'eth'
    transaction.source = 'blockchain'
    console.log('Add transaction to collection: ', transaction.hash)
    return addOrUpdateTransaction(transaction)
  }
}

async function getLatestSyncedBlockNumber () {
  // return the number of the latest block that has been synced to the db
  // TODO: a block may have more than one transaction - this function should return
  // the latest block in which *all* transactions have been synced
  let latestBlock

  latestBlock = Transactions.findOne({}, {
    sort: {
      blockNumber: -1
    }
  })

  return latestBlock.blockNumber
}

export {
  syncTransactions,
  watchTransactions,
  addETHTransaction,
  addPTITransaction

}
