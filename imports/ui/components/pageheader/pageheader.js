import { web3 } from '/imports/lib/ethereum/web3.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import './pageheader.html'

Template.pageheader.helpers({
  userPTIAddress () {
    return web3.toChecksumAddress(getUserPTIAddress())
  }
})
