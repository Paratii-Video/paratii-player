import { getUserPTIAddress } from '/imports/api/users.js'
import { UserTransactions } from '/imports/api/transactions.js'
import { web3 } from '/imports/lib/ethereum/web3.js'

import './transactions.html'

const moment = require('moment')

function getBitTransactions () {
  let localLedger = window.localStorage.getItem('paratii-ledger')
  if (localLedger) {
    localLedger = JSON.parse(localLedger)
  } else {
    return null
  }
  let resp = []
  console.log('localLedger ', localLedger)
  let keys = Object.keys(localLedger)
  for (let i = 0; i < keys.length; i++) {
    resp.push({
      peer: keys[i],
      bytesSent: localLedger[keys[i]].bytesSent,
      bytesRecv: localLedger[keys[i]].bytesRecv
    })
  }
  console.log('bit Accounting ', JSON.stringify(resp))

  return resp
}

getBitTransactions()

Template.transactions.onCreated(function () {
  let template = Template.instance()

  template.searchQuery = new ReactiveVar()
  template.searching = new ReactiveVar(false)

  const userPTIAddress = getUserPTIAddress()
  Meteor.subscribe('userTransactions', userPTIAddress)
})

Template.registerHelper('formatDate', function (timestamp) {
  return moment(timestamp).format('YYYY/M/D H:mm:ss')
})

Template.registerHelper('equals', function (a, b) {
  return a === b
})

Template.registerHelper('toEther', function (a) {
  return parseFloat(web3.fromWei(a, 'ether'))
})

Template.transactions.helpers({
  transactions () {
    let query = {}
    let template = Template.instance()
    let regex = new RegExp(template.searchQuery.get(), 'i')

    query = {
      $or: [
        { _id: regex },
        { description: regex },
        { currency: regex },
        { from: regex },
        { to: regex }
      ]
    }
    return UserTransactions.find(query, { sort: { blockNumber: -1 } })
  },
  userPTIAddress () {
    return getUserPTIAddress()
  }
})

Template.transactions.events({
  'keyup [name="search"]' (event, template) {
    let value = event.target.value.trim()

    if (value !== '' && event.keyCode === 13) {
      template.searchQuery.set(value)
      template.searching.set(true)
    }

    if (value === '') {
      template.searchQuery.set(value)
    }
  }
})
