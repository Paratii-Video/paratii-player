// Server entry point, imports all server code

import '../imports/startup/server'
import '../imports/startup/server/fixtures.js'
import '../imports/startup/both'
import '../imports/api/users.js'
import { watchTransactions, syncTransactions } from '/imports/api/transactions.js'
import { web3 } from '/imports/lib/ethereum/connection.js'
import { deployParatiiContracts } from '/imports/lib/ethereum/helpers.js'
import { setRegistryAddress } from '/imports/lib/ethereum/contracts.js'

const DEFAULT_PROVIDER = Meteor.settings.public.http_provider

if (Meteor.settings.public.first_block === undefined) {
  Meteor.settings.public.first_block = 0
}

web3.setProvider(new web3.providers.HttpProvider(DEFAULT_PROVIDER))

Meteor.startup(async function () {
  console.log('settings.public.http_provider: ', Meteor.settings.public.http_provider)

  Meteor.defer(function () {
    // sync the transaction history - update the collection to include the latest blocks
    // chain start sync from block 267 because it takes to long start from 0
    if (Meteor.settings.syncTransactionsOnStartup) {
      syncTransactions()
    }
  })
  Meteor.defer(function () {
    if (Meteor.settings.public.isTestEnv) {
      // if we are in a test environment, we will deploy the contracts before starting to watch
      console.log('Test environment: deploying contracts on startup')
      deployParatiiContracts().then(function (contracts) {
        console.log(`${contracts.length} contracts deployed`)
        console.log(contracts['ParatiiRegistry'].address)
        Meteor.settings.public.ParatiiRegistry = contracts['ParatiiRegistry'].address
        console.log('  Meteor.settings.public.ParatiiRegistry:', Meteor.settings.public.ParatiiRegistry)
        setRegistryAddress(contracts['ParatiiRegistry'].address)
        watchTransactions()
        Meteor.methods({
          getRegistryAddress: function () {
            return Meteor.settings.public.ParatiiRegistry
          }
        })
      })
    } else {
      watchTransactions()
    }
  })
})
