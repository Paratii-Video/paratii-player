import { check } from 'meteor/check';

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
  Meteor.publish('videos', function videosPublication() {
    return Videos.find();
  });
}

Meteor.methods({
  'videos.like'(videoId) {
    check(videoId, String);
    // check first if the current user has already voted
    const user = Meteor.users.findOne({ _id: this.userId });
    if (!user) {
      return false;
    }

    // if the user has already likes this video, we don't do anything
    if (userLikesVideo(this.userId, videoId)) {
      return false;
    }
    // if the user has disliked this video, we remove the dislike
    if (userDislikesVideo(this.userId, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.dislikes': -1 } });
      Meteor.users.update(this.userId, { $pull: { 'stats.dislikes': videoId } });
    }

    Meteor.users.update(this.userId, { $addToSet: { 'stats.likes': videoId } });
    Videos.update(videoId, { $inc: { 'stats.likes': 1 } });
    return true;
  },
  'videos.dislike'(videoId) {
    check(videoId, String);
    // check first if the current user has already voted
    const user = Meteor.users.findOne({ _id: this.userId });
    if (!user) {
      return false;
    }

    // if the user has already likes this video, we don't do anything
    if (userDislikesVideo(this.userId, videoId)) {
      return false;
    }
    // if the user has disliked this video, we remove the dislike
    if (userLikesVideo(this.userId, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.likes': -1 } });
      Meteor.users.update(this.userId, { $pull: { 'stats.likes': videoId } });
    }

    Meteor.users.update(this.userId, { $addToSet: { 'stats.dislikes': videoId } });
    Videos.update(videoId, { $inc: { 'stats.dislikes': 1 } });
    return true;
  },
});
