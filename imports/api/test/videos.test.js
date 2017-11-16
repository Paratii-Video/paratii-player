import { Meteor } from 'meteor/meteor'
import { assert } from 'chai'

import { Videos, userLikesVideo, userDislikesVideo } from '../videos.js'

function likeVideo (address, videoId) {
  Meteor.call('videos.like', address, videoId)
}

function dislikeVideo (address, videoId) {
  Meteor.call('videos.dislike', address, videoId)
}

describe('Videos', () => {
  describe('methods', () => {
    let userId
    let videoId
    let userAddress = '0x123455'

    beforeEach(() => {
      Videos.remove()
      videoId = Videos.insert({
        title: 'title-of-video',
        price: 1234,
        stats: {
          likes: 3141,
          dislikes: 2718
        }
      })
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

    it('userLikesVideo returns correct value', () => {
      assert.equal(userLikesVideo(userAddress, videoId), false)
      likeVideo(userAddress, videoId)
      assert.equal(userLikesVideo(userAddress, videoId), true)
    })

    it('userDislikesVideo returns correct value', () => {
      assert.equal(userDislikesVideo(userAddress, videoId), false)
      dislikeVideo(userAddress, videoId)
      assert.equal(userDislikesVideo(userAddress, videoId), true)
    })

    it('videos.like works as expected', () => {
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141)

      // the first like shoudl increment the likes counter with 1
      likeVideo(userAddress, videoId)
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3142)
      // the like is also registered with the user
      // assert.deepEqual(Meteor.users.findOne({ _id: userId }).stats.likes, [videoId])

      // if our user likes the same video again, it will have no effect
      likeVideo(userAddress, videoId)
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3142)
      assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2718)

      // if the user dislikes the video, the likes counter will be down
      dislikeVideo(userAddress, videoId)
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141)
      assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2719)

      // dislikes again and nothing will change, the likes counter will be down
      dislikeVideo(userAddress, videoId)
      assert.equal(Videos.findOne({ _id: videoId }).stats.likes, 3141)
      assert.equal(Videos.findOne({ _id: videoId }).stats.dislikes, 2719)
    })
  })
})
