/* eslint-disable no-console */
import { web3, updateSession } from '/imports/lib/ethereum/connection.js'
import { setRegistryAddress, getContractAddress } from '/imports/lib/ethereum/contracts.js'
import { getKeystore, sendUnSignedContractTransaction, sendUnSignedTransaction } from '/imports/lib/ethereum/wallet.js'
import { deployParatiiContracts } from '/imports/lib/ethereum/helpers.js'
import { Template } from 'meteor/templating'
import { getUserPTIAddress } from '/imports/api/users.js'
import './debug.html'

Template.debug.events({
  'click #get-some-PTI' () {
    sendUnSignedContractTransaction(web3.eth.accounts[0], 10)
  },
  'click #get-some-ETH' () {
    sendUnSignedTransaction(web3.eth.accounts[0], 10)
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
    return getContractAddress('ParatiiToken')
  },
  ParatiiRegistryAddress () {
    return Session.get('ParatiiRegistry')
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
  contracts () {
    Session.get('contracts')
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
  }
  // user() {
  //  return Meteor.user();
  // },
})
