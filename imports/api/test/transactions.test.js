import { Meteor } from 'meteor/meteor'
import { assert } from 'chai'
import { Transactions, addETHTransaction, addPTITransaction } from '../transactions.js'

const BigNumber = require('bignumber.js')

describe('Transactions', () => {
  if (Meteor.isServer) {
    describe('methods', () => {
      let userId
      beforeEach(() => {
        Transactions.remove({})
        Meteor.users.remove()
        const user = {
          name: 'Rosencrantz',
          stats: {
            likes: [],
            dislikes: []
          }
        }
        userId = Meteor.users.insert(user)
        Meteor.userId = function () {
          return userId
        }
        Meteor.user = function () {
          return Meteor.users.findOne({ _id: userId })
        }
      })

      it('insert an ETH transaction', async () => {
        assert.equal(Transactions.find().count(), 0)
        let tx = {
          value: new BigNumber(12345566),
          from: 0x12345,
          to: 0x23445,
          hash: 'aldsfajalkajfd',
          nonce: 2,
          blockNumber: 22
        }
        await addETHTransaction(tx)
        assert.equal(Transactions.find().count(), 1)
        // if we try to add an ETH transaction with the same hash a second time, it will fail silently
        addETHTransaction(tx)
        assert.equal(Transactions.find().count(), 1)
      })

      it('insert a PTI transaction', async () => {
        assert.equal(Transactions.find().count(), 0)
        let tx = {
          nonce: 2,
          blockNumber: 1,
          transactionHash: 0x1245,
          args: {
            value: new BigNumber(333),
            from: 0x12345,
            to: 0x23445
          },
          topics: [0x1232143]
        }

        await addPTITransaction(tx)
        // Transactions.insert(tx)
        assert.equal(Transactions.find().count(), 1)
        // if we try to add an ETH transaction with the same hash a second time, it will fail silently
        addPTITransaction(tx)
        assert.equal(Transactions.find().count(), 1)
      })
    })
  }
})
