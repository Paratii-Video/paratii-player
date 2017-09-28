import { Template } from 'meteor/templating'
import { doTx } from '/imports/lib/ethereum/wallet.js'
import { web3 } from '/imports/lib/ethereum/web3.js'
import { checkPassword } from '/imports/api/users.js'

import '/imports/lib/validate.js'
import './doTransaction.html'

Template.doTransaction.onCreated(function () {
  console.log(web3)
})

Template.doTransaction.helpers({
  ima () {
    return Session.get('dataUrl')
  },
  userEmail () {
    return Meteor.user().emails[0].address
  },
  getErrors (name) {
    const check = Session.get('checkTransaction')
    return check[name]
  }
})

Template.doTransaction.events({
  async 'submit #form-doTransaction' (event) {
    event.preventDefault()
    const extraInfo = {}
    const type = this.type // Get the context from Template
    const amount = event.target.wallet_amount.value
    const recipient = event.target.wallet_friend_number.value
    const password = event.target.user_password.value
    const description = event.target.tx_description.value
    let balance
    const check = Session.get('checkTransaction')

    switch (type) {
      case 'Eth':
        balance = web3.fromWei(Session.get('eth_balance'), 'ether')
        break
      case 'PTI':
        balance = web3.fromWei(Session.get('pti_balance'), 'ether')
        extraInfo.videoid = this.videoid // Video id whne you unlock a video
        break
      default:
    }

    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) === true) {
      check.wallet_amount = 'This value is not allowed'
    } else if (parseFloat(amount) > parseFloat(balance)) {
      check.wallet_amount = `You don't have enough ${this.label}`
    } else {
      check.wallet_amount = null
    }

    const isvalid = await checkPassword(password)
    if (isvalid === true) {
      check.user_password = null
    } else {
      check.user_password = 'Wrong password'
    }
    const errors = _.find(check, function (value) {
      return value != null
    })
    Session.set('checkTransaction', check)
    if (errors === undefined) {
      Modal.hide('doTransaction')
      doTx(amount, recipient, password, type, description, extraInfo)
    }
  }
})
