/* globals Modal */
import './profile.html'

import { getKeystore } from '/imports/lib/ethereum/wallet.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { Events } from '/imports/api/events.js'
import { web3 } from '/imports/lib/ethereum/web3.js'
import { showModal, showGlobalAlert, formatCoinBalance, __ } from '/imports/lib/utils.js'
import '/imports/ui/components/modals/mainModal.js'
import '/imports/ui/components/modals/editProfile.js'
import '/imports/ui/components/modals/doTransaction.js'
import '/imports/ui/components/modals/regenerateKeystore.js'
import '/imports/ui/components/modals/restoreKeystore.js'
import '/imports/ui/components/modals/createNewWallet.js'
import '/imports/ui/components/modals/showSeed.js'
import '/imports/ui/components/modals/modals.js'
import '/imports/ui/components/buttons/fullScreenButton.js'
import '/imports/ui/components/internals/internalsHeader.js'
import '/imports/ui/components/buttons/settingsButton.js'

Template.profile.onCreated(function () {
  Session.set('editProfileMenuOpen', false)
})

Template.profile.onRendered(function () {
  showGlobalAlert('<strong>' + __('No money here') + '</strong>, ' + __('Still a demo'))
})

Template.profile.helpers({
  editProfileMenuOpen  () {
    return Session.get('editProfileMenuOpen')
  },
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
    let address = getUserPTIAddress()
    if (address !== null) {
      return web3.toChecksumAddress(address)
    } else {
      return ''
    }
  },
  eth_balance () {
    const connected = Session.get('eth_isConnected')
    const balance = Session.get('eth_balance')
    if (!connected) {
      return 'Not connected to blockchain'
    }
    if (balance !== undefined) {
      if (balance > 0) {
        const amount = web3.fromWei(balance, 'ether')
        return `<span class="amount">${formatCoinBalance(amount)}</span> <span class="unit"> ETH</span>`
      } else {
        return 'You don\'t own Ether'
      }
    }
    return 'Connecting to blockchain...'
  },
  pti_balance () {
    const connected = Session.get('eth_isConnected')
    const balance = Session.get('pti_balance')
    if (!connected) {
      return 'Not connected to blockchain'
    }
    if (balance !== undefined) {
      if (balance > 0) {
        const amount = web3.fromWei(balance, 'ether')
        return `<span class="amount">${formatCoinBalance(amount)}</span> <span class="unit"> PTI</span>`
      } else {
        return 'You don\'t own Paratii'
      }
    }
    return 'Connecting to blockchain...'
  },
  wallet_is_generating () {
    return Session.get('wallet-state') === 'generating'
  }

})

Template.profile.events({
  'click #create-wallet' () {
    showModal('createNewWallet')
  },
  'click #send-eth' () {
    showModal('doTransaction', { type: 'Eth', label: 'Send Ether' })
  },
  'click #send-pti' () {
    showModal('doTransaction', { type: 'PTI', label: 'Send Paratii' })
  },
  'click #restore-keystore' () {
    showModal('restoreKeystore')
  },
  'click #show-seed' () {
    showModal('showSeed')
  },
  'click .button-settings' () {
    Session.set('editProfileMenuOpen', true)
  },
  'click' (e) {
    if (Session.get('editProfileMenuOpen')) {
      const menu = document.querySelectorAll('.edit-profile-menu')
      if (!menu.length || !menu[0].contains(e.target)) {
        $(menu[0]).removeClass('show')
        Meteor.setTimeout(() => {
          Session.set('editProfileMenuOpen', false)
        }, 250)
      }
    }
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
