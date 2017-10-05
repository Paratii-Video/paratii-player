import { PTIContract } from '/imports/lib/ethereum/connection.js'
import { web3 } from '/imports/lib/ethereum/web3.js'
import { Settings } from './settings.js'
import { addETHTransaction, addPTITransaction } from './transaction.js'

export const TransactionSyncHistory = new Mongo.Collection('transactionSyncHistory')

/* Functions for syncing the database with historical data on the blockchain */

export async function syncTransactions () {
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
  // XXX: This is absolete - we only write event logs to the transaction history...
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
