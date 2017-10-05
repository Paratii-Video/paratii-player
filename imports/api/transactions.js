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
    // TODO: SIMPLIFY ThIS
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
        videoid: { $push: '$videoid' }
        // data: {$push: '$date'}
      }
      }
    ],
      {clientCollection: 'userTransactions'}
    )
  })
} // this bracket closes Meteor.isServer()

export async function addOrUpdateTransaction (transaction) {
  // add (or update) a transaction in the collection
  // transaction is a json object similar to a transaction log - cf the check() invocation below
  // transactions are identified by transaction.hash
  console.log('Add event to collection: ', transaction.hash)
  console.log(transaction)

  try {
    check(transaction, {
      blockNumber: Match.Integer,
      currency: String,
      date: Match.Maybe(Date),
      description: Match.Maybe(String),
      from: String,
      hash: String,
      logIndex: Match.Integer,
      nonce: Match.Maybe(Number),
      source: String,
      to: String,
      value: Match.Maybe(Number)
    })
  } catch (err) {
    console.log(err)
    throw err
  }

  /*
   * TODO:
   * lines up to //--------------------------- are a TEMPORART HACK
   *   what we really want is to save each Event in the database, I (jelle) think like this
   *
   * { _id: transactionHash,
   *   blockNumber: ..
   *   (and other blocklevel info...)
   *   events: {    console.log(log.args)

   *    2: { // this is the logIndex
   *       description: ..
   *       from: ..
  *     [here all event ]
   *   }
   * }
   *
   */
  if (transaction.source === 'PTIContract.Transfer') {
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    console.log(transaction.hash)
    console.log(transaction.source)
    let existingTransaction = Transactions.findOne({ hash: transaction.hash, source: 'VideoStore.BuyVideo' })
    console.log(existingTransaction)
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    if (existingTransaction) {
      // Dont add a PTIContract.transfer event if we already have a buyvideo event in the same transaction
      return
    }
  }
  // -----------------end of terrible hack ----
  Transactions.upsert(transaction.hash, transaction)
}

export function watchEvents () {
  watchPTIContractTransferEvents()
  watchSendEtherEvents()
  watchVideoStoreBuyVideoEvents()
}

async function watchSendEtherEvents () {
  console.log('Watching for ETH Transactions')
  let filter = (await getContract('SendEther')).LogSendEther({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  })

  filter.watch(function (error, log) {
    if (error) {
      console.log(error)
    }
    const transaction = {
      blockNumber: log.blockNumber,
      currency: 'ETH',
      description: log.args.description || '',
      from: log.args.from,
      hash: log.transactionHash,
      logIndex: log.logIndex,
      to: log.args.to,
      source: 'SendEther.LogSendEther',
      value: log.args.value.toNumber()
    }
    return addOrUpdateTransaction(transaction)
  })
};

async function watchPTIContractTransferEvents () {
  // set a filter for ALL PTI transactions    console.log(log.args)

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
    const transaction = {
      blockNumber: log.blockNumber,
      currency: 'PTI',
      description: log.args.description || '',
      from: log.args.from,
      hash: log.transactionHash,
      logIndex: log.logIndex,
      source: 'PTIContract.Transfer',
      to: log.args.to,
      value: log.args.value && log.args.value.toNumber()
    }
    return addOrUpdateTransaction(transaction)
  })
}
//
async function watchVideoStoreBuyVideoEvents () {
  console.log('Watching the VideoStore')
  let filter = (await getContract('VideoStore')).LogBuyVideo({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  })

  filter.watch(Meteor.bindEnvironment(
    function (error, log) {
      console.log('Adding a BuyVideo to event log ')
      if (error) {
        console.log(error)
        throw (error)
      }
      /* register the sale in the user collection */
      // find our user
      let user = Meteor.users.findOne({'profile.ptiAddress': log.args.buyer})
      if (!user) {
        console.log(`No user found with account ${log.args.buyer}!`)
        // so we create a new user object to at least have some trace of the sale
      } else {
        let videos = user.profile.videos || {}
        videos[log.args.videoId] = { acquired: log.transactionHash }
        Meteor.users.update(user._id, {$set: {'profile.videos': videos}})
      }

      /* add the transaction to the transaction history */
      const transaction = {
        blockNumber: log.blockNumber,
        currency: 'PTI',
        description: `Bought video ${log.args.videoId}`,
        from: log.args.buyer,
        hash: log.transactionHash,
        logIndex: log.logIndex,
        source: 'VideoStore.BuyVideo',
        to: '',
        value: log.args.price && log.args.price.toNumber()
      }
      addOrUpdateTransaction(transaction)
    })
  )
};
