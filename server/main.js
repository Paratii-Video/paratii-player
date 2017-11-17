// Server entry point, imports all server code

import '../imports/startup/server'
import '../imports/startup/both'
import '../imports/startup/server/fixtures.js'
import '../imports/api/users.js'
import '../imports/api/mail.js'
import { setHead } from '/imports/lib/head'

import { watchEvents, syncTransactions } from '/imports/api/transactions.js'

if (Meteor.settings.public.first_block === undefined) {
  Meteor.settings.public.first_block = 0
}
// SETTING THE HEAD
setHead()

Meteor.startup(async function () {
  if (Meteor.settings.env.mail_server == null) {
    process.env.MAIL_URL = Meteor.settings.env.mail_server
  }

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
      watchEvents()
    }
  })

  Meteor.methods({
    'getRegistryAddress' () {
      return Meteor.settings.public.ParatiiRegistry
    }
  })
})
