import { check } from 'meteor/check'
// import { Transactions } from '/imports/api/transactions.js'
import { Playlists } from '/imports/api/playlists.js'

export const Videos = new Mongo.Collection('videos')
export function userLikesVideo (userId, videoId) {
  return Boolean(
    Meteor.users.findOne({ _id: userId, 'stats.likes': { $in: [videoId] } })
  )
}

export function userDislikesVideo (userId, videoId) {
  return Boolean(
    Meteor.users.findOne({ _id: userId, 'stats.dislikes': { $in: [videoId] } })
  )
}

if (Meteor.isServer) {
  // Publish all videos
  Meteor.publish('videos', function () {
    return Videos.find()
  })

  // Publish one video by id
  Meteor.publish('videoPlay', function (_id) {
    return Videos.find(_id)
  })

  // Publish videos by playlist
  Meteor.publish('videosPlaylist', function (_id) {
    if (_id === null) {
      return Videos.find()
    } else {
      const playlist = Playlists.findOne({_id})
      const videosIds = playlist.videos
      return Videos.find({ _id: { '$in': videosIds } })
    }
  })

  Meteor.methods({
    'videos.isLocked' (videoId, userAddress) {
      const video = Videos.findOne({ _id: videoId })
      if (video && video.price === 0) {
        return false // Video is free, it doesn't have a price
      } else {
        let user = Meteor.users.findOne({'profile.ptiAddress': userAddress})
        if (user && user.profile && user.profile.videos && (videoId in user.profile.videos)) {
          return false
        }
        return true
      }
    }
  })
}
Meteor.methods({
  'videos.like' (videoId) {
    check(videoId, String)
    const currentUserId = Meteor.userId()
    if (!currentUserId) {
      return false
    }

    // if the user has already likes this video, we don't do anything
    if (userLikesVideo(currentUserId, videoId)) {
      return false
    }
    // if the user has disliked this video, we remove the dislike
    if (userDislikesVideo(currentUserId, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.dislikes': -1 } })
      Meteor.users.update(this.userId, { $pull: { 'stats.dislikes': videoId } })
    }

    Meteor.users.update(currentUserId, { $addToSet: { 'stats.likes': videoId } })
    Videos.update(videoId, { $inc: { 'stats.likes': 1 } })
    return true
  },
  'videos.dislike' (videoId) {
    check(videoId, String)

    const currentUserId = Meteor.userId()

    if (!currentUserId) {
      return false
    }

    // if the user has already likes this video, we don't do anything
    if (userDislikesVideo(currentUserId, videoId)) {
      return false
    }
    // if the user has disliked this video, we remove the dislike
    if (userLikesVideo(currentUserId, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.likes': -1 } })
      Meteor.users.update(this.userId, { $pull: { 'stats.likes': videoId } })
    }

    Meteor.users.update(currentUserId, { $addToSet: { 'stats.dislikes': videoId } })
    Videos.update(videoId, { $inc: { 'stats.dislikes': 1 } })
    return true
  },
  'videos.create' (video) {
    check(video, {
      id: String,
      title: String,
      description: String,
      price: Number,
      src: String,
      thumb: String,
      mimetype: String,
      stats: {
        likes: Number,
        dislikes: Number
      },
      uploader: {
        name: String
      },
      tags: Array
    })
    Videos.insert({
      _id: video.id,
      title: video.title,
      price: video.price,
      description: video.description,
      src: video.src,
      stats: video.stats,
      mimetype: video.mimetype,
      tags: video.tags,
      uploader: {
        name: video.uploader.name
      }
    })
    return video.id
  }

})
