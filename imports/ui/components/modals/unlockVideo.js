import { Template } from 'meteor/templating'
import { sendTransaction } from '/imports/lib/ethereum/wallet.js'
import { web3 } from '/imports/lib/ethereum/connection.js'
import { getContract } from '/imports/lib/ethereum/contracts.js'
import { checkPassword } from '/imports/api/users.js'
import '/imports/lib/validate.js'
import './unlockVideo.html'

var promisify = require('promisify-node')

Template.unlockVideo.helpers({
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

Template.unlockVideo.events({
  async 'submit #form-unlockVideo' (event) {
    event.preventDefault()
    let amount = event.target.wallet_amount.value
    let price = web3.toWei(amount)
    let videoId = this.videoid // Video id whne you unlock a video
    const password = event.target.user_password.value
    const check = Session.get('checkTransaction')

    let balance
    balance = web3.fromWei(Session.get('pti_balance'), 'ether')

    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) === true) {
      check.wallet_amount = 'This value is not allowed'
    } else if (parseFloat(amount) > parseFloat(balance)) {
      check.wallet_amount = `You don't have enough PTI: your balance is ${balance}`
    } else {
      check.wallet_amount = null
    }

    let ethBalance = Session.get('eth_balance')

    if (ethBalance === 0) {
      check.wallet_amount = `You need some Ether for sending a transaction - but you have none`
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
      Modal.hide('unlockVideo')
      // the transaction has two steps - we first approve that the paratiiavatar can move `price`, and then instruct the videoStore to buy the video
      console.log(`approve ${price}`)
      let paratiiAvatar = await getContract('ParatiiAvatar')
      await promisify(sendTransaction)(password, 'ParatiiToken', 'approve', [paratiiAvatar.address, price], 0)
      console.log(`buyVideo ${videoId}`)
      await promisify(sendTransaction)(password, 'VideoStore', 'buyVideo', [videoId], 0)
    }
  }
})
