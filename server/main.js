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
  process.env.MAIL_URL = 'smtp://AKIAJ4WFPL45IS4LZAZQ:AhoGWyyEtivjS9eMdC10uYE4tuvclLcPXLr55Ex+ERcy@email-smtp.us-west-2.amazonaws.com:587'
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

  Meteor.methods({
    'getVersion' () {
      return Assets.getText('version.json')
    }
  })
})
