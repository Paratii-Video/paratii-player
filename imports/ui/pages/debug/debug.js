/* eslint-disable no-console */
import { web3 } from '/imports/lib/ethereum/web3.js'
import { updateSession } from '/imports/lib/ethereum/connection.js'
import { setRegistryAddress, getContractAddress } from '/imports/lib/ethereum/contracts.js'
import { getKeystore } from '/imports/lib/ethereum/wallet.js'
import { deployParatiiContracts, sendSomeETH, sendSomePTI } from '/imports/lib/ethereum/helpers.js'
import { Template } from 'meteor/templating'
import { getUserPTIAddress } from '/imports/api/users.js'
import './debug.html'

Template.debug.onCreated(function () {
  // Meteor.call('getRegistryAddress', function (error, result) {
  //   Session.set('ParatiiRegistry', result)
  // })
  getContractAddress('ParatiiToken').then(function (result) {
    Session.set('ParatiiToken', result)
  })
  getContractAddress('ParatiiRegistry').then(function (result) {
    Session.set('ParatiiRegistry', result)
  })
  getContractAddress('VideoRegistry').then(function (result) {
    Session.set('VideoRegistry', result)
  })
})

Template.debug.events({
  'click #get-some-PTI' () {
    let beneficiary = getUserPTIAddress()
    sendSomePTI(beneficiary, 10)
  },
  'click #get-some-ETH' () {
    let beneficiary = getUserPTIAddress()

    sendSomeETH(beneficiary, 10)
  },
  'click #update-Session' () {
    updateSession()
  },
  'click #deploy-contracts' () {
    deployParatiiContracts().then(function (contracts) {
      setRegistryAddress(contracts['ParatiiRegistry'].address)
      Session.set('contracts', contracts)
      updateSession()
    })
  }
})

Template.debug.helpers({
  privateKey () {
    // not included in wallet because is unsafe
    const keystore = getKeystore()
    if (!keystore) {
      return
    }
    keystore.keyFromPassword('password', function (err, pwDerivedKey) {
      if (err) {
        console.log(err)
        return
      }
      Session.set('privateKey', keystore.exportPrivateKey(getUserPTIAddress(), pwDerivedKey))
    })

    return Session.get('privateKey')
  },
  contractAddress () {
    return Session.get('ParatiiToken')
  },
  ParatiiRegistryAddress () {
    return Session.get('ParatiiRegistry')
  },
  VideoRegistryAddress () {
    return Session.get('VideoRegistry')
  },
  isTestRPC () {
    return Session.get('isTestRPC')
  },
  eth_host () {
    return Session.get('eth_host')
  },
  eth_isConnected () {
    return Session.get('eth_isConnected')
  },
  eth_currentBlock () {
    return Session.get('eth_currentBlock')
  },
  ptiAddress () {
    return getUserPTIAddress()
  },
  eth_balance () {
    const balance = Session.get('eth_balance')
    if (balance !== undefined) {
      return web3.fromWei(balance, 'ether')
    }
    return ''
  },
  pti_balance () {
    const balance = Session.get('pti_balance')
    if (balance !== undefined) {
      return web3.fromWei(balance, 'ether')
    }
    return ''
  },
  version () {
    console.log(version)
  }
})
