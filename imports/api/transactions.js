/* globals ReactiveAggregate */
import { PTIContract } from '/imports/lib/ethereum/connection.js'
import { getContract } from '../lib/ethereum/contracts.js'

/*****************************
Transactions data model looks like this.

- Documents inthe transaction hsitory are identified by the fields transactionHash and logIndex.
  - hash is the transactionHash of the transaction
  - logIndex is the index of the logged event (and cane undefined for 'native' ETH transactions that do not log anything)
- Each ETH transfer of transaction is stored undert its the hash of the transaction

- not that one Transaction can

*********************************/

export const Transactions = new Mongo.Collection('transactions')
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
  // transaction is a json object similar to a transaction log - cf the check() invocation below
  // transactions are identified by transaction.hash
  console.log('Add event to collection: ', transaction.hash)
  console.log(transaction)

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

  transaction._id = transaction.hash
  let txId = Transactions.insert(transaction)
  console.log('Transaction added')
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

async function watchTransactions () {
  watchPTITransactions()
  watchETHTransactions()
  watchVideoStore()
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
      console.log('Error watching for PTI Transactions')
      console.log(error)
      return
    }
    addPTITransaction(log)
  })
}
//
async function watchVideoStore () {
  console.log('Watching the VideoStore')
  let filter = (await getContract('VideoStore')).LogBuyVideo({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  })

  filter.watch(function (error, log) {
    console.log('Adding a BuyVideo ')
    if (error) {
      // TODO: proper error handling
      console.log('Error setting filter')
      console.log(error)
      return
    }
    log.args.from = log.args.buyer
    log.args.description = `Bought video ${log.args.videoId}`
    log.args.value = log.args.price
    log.args.to = ''
    console.log(log.args)
    addPTITransaction(log)
  })
};

function addPTITransaction (log) {
  // add a transaction to the collection that derives from Transfer Event from PTI contract
  // const tx = web3.eth.getTransaction(log.transactionHash)
  console.log('Adding PTI Transaction')
  console.log(log.logIndex)
  const transaction = {}
  transaction.value = log.args.value && log.args.value.toNumber()
  transaction.from = log.args.from
  transaction.to = log.args.to
  transaction.description = log.args.description || ''
  // transaction.hash = log.topics[0]
  transaction.hash = log.transactionHash
  transaction.logIndex = log.logIndex
  transaction.blockNumber = log.blockNumber
  transaction.currency = 'PTI'
  transaction.source = 'event'
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

export {
  addETHTransaction,
  addPTITransaction,
  watchTransactions
}
