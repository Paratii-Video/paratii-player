/* globals Modal */

import { getKeystore } from '/imports/lib/ethereum/wallet.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { Events } from '/imports/api/events.js'
import { web3 } from '/imports/lib/ethereum/web3.js'

import '/imports/ui/components/modals/editProfile.js'
import '/imports/ui/components/modals/doTransaction.js'
import '/imports/ui/components/modals/restoreKeystore.js'
import '/imports/ui/components/modals/showSeed.js'
import './profile.html'

Template.profile.helpers({
  events () {
    // Perform a reactive database query against minimongo
    return Events.find()
  },
  userEmail () {
    return Meteor.user().emails[0].address
  },
  hasKeystore () {
    return (getKeystore() !== undefined) ? getKeystore() : false
  },
  userPTIAddress () {
    return getUserPTIAddress()
  },
  eth_balance () {
    const balance = Session.get('eth_balance')
    if (balance !== undefined && balance > 0) {
      return web3.fromWei(balance, 'ether')
    }
    return false
  },
  pti_balance () {
    const balance = Session.get('pti_balance')
    if (balance !== undefined && balance > 0) {
      return web3.fromWei(balance, 'ether')
    }
    return false
  },
  wallet_is_generating () {
    return Session.get('wallet-state') === 'generating'
  }

})

Template.profile.events({
  'click #create-wallet' () {
    Modal.show('showSeed', { type: 'create' })
  },
  'click #send-eth' () {
    Modal.show('doTransaction', { type: 'Eth', label: 'Send Ether' })
  },
  'click #send-pti' () {
    Modal.show('doTransaction', { type: 'PTI', label: 'Send Paratii' })
  },
  'click #restore-keystore' () {
    Modal.show('restoreKeystore', {})
  },
  'click #show-seed' () {
    Modal.show('showSeed', { type: 'show' })
  },
  'click #edit-profile' () {
    const modalOptions = {
    }
    Modal.show('editProfile', {
    }, modalOptions)
  }
})

Template.transaction.helpers({
  sendCheck () {
    if (this.sender === getUserPTIAddress()) {
      return true
    }
    return false
  }
})
