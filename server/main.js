// Server entry point, imports all server code

import '../imports/startup/server'
import '../imports/startup/both'
import '../imports/startup/server/fixtures.js'
import '../imports/api/users.js'
import { watchTransactions, syncTransactions } from '/imports/api/transactions.js'

if (Meteor.settings.public.first_block === undefined) {
  Meteor.settings.public.first_block = 0
}

Meteor.startup(async function () {
  Meteor.defer(function () {
    // sync the transaction history - update the collection to include the latest blocks
    // chain start sync from block 267 because it takes to long start from 0
    if (Meteor.settings.syncTransactionsOnStartup) {
      syncTransactions()
    }
  })
  Meteor.defer(function () {
    if (Meteor.settings.public.isTestEnv) {
      // if we are in a test environment, we need to set the wathcer only after deploying the contracts
      // this happens in fixtures.js
    } else {
      watchTransactions()
    }
  })

  Meteor.methods({
    getRegistryAddress: function () {
      return Meteor.settings.public.ParatiiRegistry
    }
  })
})
