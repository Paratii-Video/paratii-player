import { Meteor } from 'meteor/meteor'
import { assert } from 'chai'
import { Transactions, addOrUpdateTransaction } from '../transactions.js'

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
        let log = {
          transactionHash: '0xabdafe',
          nonce: 2,
          blockNumber: 22,
          logIndex: 0,
          args: {
            value: new BigNumber(12345566),
            from: '0x12345',
            to: '0x23445',
            description: 'a description'
          }
        }
        const transaction = {
          blockNumber: log.blockNumber,
          currency: 'ETH',
          description: log.args.description || '',
          from: log.args.from,
          hash: log.transactionHash,
          logIndex: log.logIndex,
          to: log.args.to,
          source: 'SendEther.LogSendEther',
          value: log.args.value.toNumber()
        }
        await addOrUpdateTransaction(transaction)
        assert.equal(Transactions.find().count(), 1)
        // if we try to add the transaction with the same hash a second time, it will fail silently
        await addOrUpdateTransaction(transaction)
        assert.equal(Transactions.find().count(), 1)
      })

      it('insert a ParatiiToken Transfer transaction', async () => {
        assert.equal(Transactions.find().count(), 0)
        let log = {
          nonce: 2,
          blockNumber: 1,
          transactionHash: '0x1245',
          logIndex: 2,
          args: {
            value: new BigNumber(333),
            from: '0x12345',
            to: '0x23445'
          },
          topics: [0x1232143]
        }
        const transaction = {
          blockNumber: log.blockNumber,
          currency: 'PTI',
          description: log.args.description || '',
          from: log.args.from,
          hash: log.transactionHash,
          logIndex: log.logIndex,
          source: 'PTIContract.Transfer',
          to: log.args.to,
          value: log.args.value && log.args.value.toNumber()
        }
        await addOrUpdateTransaction(transaction)
        assert.equal(Transactions.find().count(), 1)
        // if we try to add the transaction with the same hash a second time, it will fail silently
        await addOrUpdateTransaction(transaction)
        assert.equal(Transactions.find().count(), 1)
      })

      it('insert an BuyVideo transaction', async () => {
        assert.equal(Transactions.find().count(), 0)
        let log = {
          nonce: 2,
          blockNumber: 1,
          logIndex: 2,
          // hash: 0x1245,
          transactionHash: '0x1245',
          args: {
            price: new BigNumber(333),
            buyer: '0x12345',
            videoId: '0xThe-Video-id'
          },
          topics: [0x1232143]
        }
        const transaction = {
          blockNumber: log.blockNumber,
          currency: 'PTI',
          description: `Bought video ${log.args.videoId}`,
          from: log.args.buyer,
          hash: log.transactionHash,
          logIndex: log.logIndex,
          source: 'VideoStore.BuyVideo',
          to: '',
          value: log.args.price && log.args.price.toNumber()
        }
        await addOrUpdateTransaction(transaction)
        assert.equal(Transactions.find().count(), 1)
        // if we try to add the transaction with the same hash a second time, it will fail silently
        await addOrUpdateTransaction(transaction)
      })
    })
  }
})
