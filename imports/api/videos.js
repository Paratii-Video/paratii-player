import { check } from 'meteor/check';
import { Transactions } from '/imports/api/transactions.js';

export const Videos = new Mongo.Collection('videos');

export function userLikesVideo(userId, videoId) {
  return Boolean(
    Meteor.users.findOne({ _id: userId, 'stats.likes': { $in: [videoId] } }),
  );
}

export function userDislikesVideo(userId, videoId) {
  return Boolean(
    Meteor.users.findOne({ _id: userId, 'stats.dislikes': { $in: [videoId] } }),
  );
}

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('videos', function() {
    return Videos.find();
  });

  Meteor.methods({
    'videos.isLocked'(videoid, userAddress){
      const video = Videos.findOne( { _id: videoid } );
      if(video.price === ''){
        return false; // Video is free, it doesn't have a price
      } else {
        const videoUnlocked = Transactions.findOne( { videoid: videoid, from: userAddress, blockNumber: {$ne: null} });
        if(videoUnlocked){
          return false;
        }
      }
      return true;
    }
  });

}
Meteor.methods({
  'videos.like'(videoId) {
    check(videoId, String);
    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      return false;
    }

    // if the user has already likes this video, we don't do anything
    if (userLikesVideo(currentUserId, videoId)) {
      return false;
    }
    // if the user has disliked this video, we remove the dislike
    if (userDislikesVideo(currentUserId, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.dislikes': -1 } });
      Meteor.users.update(this.userId, { $pull: { 'stats.dislikes': videoId } });
    }

    Meteor.users.update(currentUserId, { $addToSet: { 'stats.likes': videoId } });
    Videos.update(videoId, { $inc: { 'stats.likes': 1 } });
    return true;
  },
  'videos.dislike'(videoId) {
    check(videoId, String);

    const currentUserId = Meteor.userId();

    if (!currentUserId) {
      return false;
    }

    // if the user has already likes this video, we don't do anything
    if (userDislikesVideo(currentUserId, videoId)) {
      return false;
    }
    // if the user has disliked this video, we remove the dislike
    if (userLikesVideo(currentUserId, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.likes': -1 } });
      Meteor.users.update(this.userId, { $pull: { 'stats.likes': videoId } });
    }

    Meteor.users.update(currentUserId, { $addToSet: { 'stats.dislikes': videoId } });
    Videos.update(videoId, { $inc: { 'stats.dislikes': 1 } });
    return true;
  },
  'videos.create'(video) {
    check(video, {
      id: String,
      title: String,
      price: Number,
      src: String,
      mimetype: String,
      stats: {
        likes: Number,
        dislikes: Number,
      },
    });
    Videos.insert({
      _id: video.id,
      title: video.title,
      price: video.price,
      src: video.src,
      stats: video.stats,
      mimetype: video.mimetype,
    });
    return video.id;
  },

});
