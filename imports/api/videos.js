import { check } from 'meteor/check';

export const Videos = new Mongo.Collection('videos');

function userHasLikedVideo(user, videoId) {
  return (
    user.stats &&
    user.stats.likes &&
    user.stats.likes.includes(videoId)
  );
}

function userHasDisLikedVideo(user, videoId) {
  return (
    user.stats &&
    user.stats.dislikes &&
    user.stats.dislikes.includes(videoId)
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
    if (userHasLikedVideo(user, videoId)) {
      return false;
    }
    // if the user has disliked this video, we remove the dislike
    if (userHasDisLikedVideo(user, videoId)) {
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
    if (userHasDisLikedVideo(user, videoId)) {
      return false;
    }
    // if the user has disliked this video, we remove the dislike
    if (userHasLikedVideo(user, videoId)) {
      Videos.update(videoId, { $inc: { 'stats.likes': -1 } });
      Meteor.users.update(this.userId, { $pull: { 'stats.likes': videoId } });
    }

    Meteor.users.update(this.userId, { $addToSet: { 'stats.dislikes': videoId } });
    Videos.update(videoId, { $inc: { 'stats.dislikes': 1 } });
    return true;
  },
});
