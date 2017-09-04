/* eslint-disable no-console */
import { web3 } from '/imports/lib/ethereum/connection.js'
import { getKeystore, deployTestContract, sendUnSignedContractTransaction } from '/imports/lib/ethereum/wallet.js'
import { Template } from 'meteor/templating'
import { getUserPTIAddress } from '/imports/api/users.js'
import './debug.html'

Template.debug.events({
  'click #deploy-parati-test-contract' () {
    deployTestContract(web3.eth.accounts[0])
    sendUnSignedContractTransaction(web3.eth.accounts[0], 100)
  },
  'click #get-some-PTI' () {
    sendUnSignedContractTransaction(web3.eth.accounts[0], 100)
  }
})
Template.debug.helpers({
  privateKey () {
    // not included in wallet because is unsafe
    const keystore = getKeystore()
    keystore.keyFromPassword('password', function (err, pwDerivedKey) {
      if (err) { throw err }
      Session.set('privateKey', keystore.exportPrivateKey(getUserPTIAddress(), pwDerivedKey))
    })

    return Session.get('privateKey')
  },
  contractAddress () {
    return Session.get('pti_contract_address')
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
  }
  // user() {
  //  return Meteor.user();
  // },
})
