/* globals ReactiveAggregate */
import { web3 } from '/imports/lib/ethereum/web3.js'
import { PTIContract } from '/imports/lib/ethereum/connection.js'

import { getContract } from '../lib/ethereum/contracts.js'
import { Settings } from '/imports/api/settings.js'

/*****************************
Transactions data model looks like this.

- Documents inthe transaction hsitory are identified by the fields transactionHash and logIndex.
  - hash is the transactionHash of the transaction
  - logIndex is the index of the logged event (and cane undefined for 'native' ETH transactions that do not log anything)
- Each ETH transfer of transaction is stored undert its the hash of the transaction

- not that one Transaction can

*********************************/

export const Transactions = new Mongo.Collection('transactions')
export const TransactionSyncHistory = new Mongo.Collection('transactionSyncHistory')
export const UserTransactions = new Mongo.Collection('userTransactions')

if (Meteor.isServer) {
  Meteor.publish('userTransactions', function (userPTIAddress) {
    if (!userPTIAddress) {
      return []
    }
    check(userPTIAddress, String)

    // Publish all transactions where I find userPTIAddress and blockNumber exist
    const query = {
      $or: [{
        to: userPTIAddress
      }, {
        from: userPTIAddress
      }]
    }

    // Aggregate transactions with same hash as ID and group data
    // new collections userTransactions will be published with this structures
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
  transaction.logIndex = transaction.logIndex || undefined
  try {
    check(transaction, {
      blockNumber: Match.Maybe(Number),
      currency: String,
      date: Match.Maybe(Date),
      description: Match.Maybe(String),
      from: String,
      hash: String,
      logIndex: Match.Maybe(Match.OneOf(Number, undefined)),
      nonce: Match.Maybe(Number),
      source: String,
      to: String,
      value: Match.Maybe(Number)
    })
  } catch (err) {
    console.log(err)
    throw err
  }

  let existingTransaction
  if (transaction.hash) {
    existingTransaction = await Transactions.findOne({
      hash: transaction.hash,
      logIndex: transaction.logIndex
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
    txId = existingTransaction._id
    console.log('Transaction already exists  - not added')
  } else {
    txId = Transactions.insert(transaction)
    console.log('Transaction added')
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
  let fromBlock = (await getLatestSyncedBlockNumber()) + 1
  let toBlock = web3.eth.blockNumber
  console.log(`syncing transactions from Block ${fromBlock}`)
  for (let i = fromBlock; i <= toBlock; i++) {
    let synchistory = TransactionSyncHistory.findOne(i)
    if (synchistory) {
      console.log(` block ${i} exists in db - skipping`)
    } else {
      await syncPTITransactions(i, i + 1)
      await syncETHTransactions(i, i + 1)
    }
  }
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
      console.log(error)
      throw error
    }
    logs.forEach(function (log) {
      try {
        addPTITransaction(log)
      } catch (err) {
        console.log(err)
        throw err
      }
    })
  })
}

// Itseems the only way to get the ETH transaction is by searching each block separately
// next function adapted from https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
// NB: this is *very expensive* as it makes a request for each block to be searched
async function syncETHTransactions (fromBlock, toBlock) {
  console.log('ETH SYNC FROM', fromBlock, 'TO', toBlock)
  for (let i = fromBlock; i <= toBlock; i += 1) {
    await syncBlockWithDB(i)
  }
};

async function syncBlockWithDB (blockHashOrNumber) {
  // get the block given blockHashOrNumber, find its transactions and write them to the DB

  await Meteor.wrapAsync(web3.eth.getBlock, web3.eth)(blockHashOrNumber, true, function (error, block) {
    if (error) {
      throw error
    }
    console.log('got block', block.number)
    if (block != null && block.transactions != null) {
      block.transactions.forEach(function (transaction) {
        try {
          addETHTransaction(web3.eth.getTransaction(transaction.hash))
        } catch (err) {
          console.log(err)
          throw err
        }
      })
    }
    TransactionSyncHistory.upsert(block.number, {'isSynced': true})

    // Settings.update('latestSyncedBlockNumber', { value: block.number })
  })
}

async function watchTransactions () {
  watchPTITransactions()
  watchETHTransactions()
}

async function watchETHTransactions () {
  console.log('Watching for ETH Transactions')
  let filter = (await getContract('SendEther')).LogSendEther({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  })

  filter.watch(function (error, log) {
    if (error) {
      // TODO: proper error handling
      console.log('Error setting filter')
      console.log(error)
      return
    }
    addETHTransaction(log)
  })
};

async function watchPTITransactions () {
  // set a filter for ALL PTI transactions
  console.log('Watching for PTI Transactions')
  let filter = (await PTIContract()).Transfer({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  })

  filter.watch(function (error, log) {
    if (error) {
      // TODO: proper error handling
      console.log('Error setting filter')
      console.log(error)
      return
    }
    addPTITransaction(log)
  })
}

function addPTITransaction (log) {
  // add a transaction to the collection that derives from Transfer Event from PTI contract
  // const tx = web3.eth.getTransaction(log.transactionHash)
  console.log('Adding PTI Transaction')
  console.log(log.logIndex)
  const transaction = {}
  transaction.value = log.args.value.toNumber()
  transaction.from = log.args.from
  // transaction.hash = log.topics[0]
  transaction.hash = log.transactionHash
  transaction.logIndex = log.logIndex
  transaction.blockNumber = log.blockNumber
  transaction.to = log.args.to
  transaction.currency = 'PTI'
  transaction.source = 'event'
  console.log('Add event to collection: ', transaction.hash)
  return addOrUpdateTransaction(transaction)
}

function addETHTransaction (log) {
  console.log('Adding ETH Transaction')
  console.log(log.logIndex)
  console.log(log.args)
  const transaction = {}
  transaction.value = log.args.value.toNumber()
  transaction.from = log.args.from
  // transaction.hash = log.topics[0]
  transaction.hash = log.transactionHash
  transaction.logIndex = log.logIndex
  transaction.blockNumber = log.blockNumber
  transaction.to = log.args.to
  transaction.description = log.args.description || ''
  transaction.currency = 'ETH'
  transaction.source = 'event'
  console.log('Add event to collection: ', transaction.hash)
  return addOrUpdateTransaction(transaction)
}

// function addAppTransaction (tx) {
//   // add information from the application to the Transaction history
//   check(tx, Object)
//   const transaction = {
//     nonce: web3.toDecimal(tx.nonce),
//     from: tx.from,
//     to: tx.to,
//     description: tx.description,
//     source: 'app',
//     // value: tx.value,
//     currency: tx.currency,
//     date: new Date(),
//     hash: tx.hash
//   }
//
//   console.log('Inserting Transaction from  Client Application', transaction)
//   return addOrUpdateTransaction(transaction)
// }

function getLatestSyncedBlockNumber () {
  // return the number of the latest block that has been synced to the db
  // TODO: a block may have more than one transaction - this function should return
  // the latest block in which *all* transactions have been synced
  let latestBlock

  latestBlock = Settings.findOne('latestSyncedBlockNumber')
  if (latestBlock) {
    return latestBlock.value
  } else {
    return 0
  }
}

export {
  addETHTransaction,
  addPTITransaction,
  syncTransactions,
  watchTransactions
}
