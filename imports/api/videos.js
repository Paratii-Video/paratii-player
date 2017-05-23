import { check } from 'meteor/check';

export const Videos = new Mongo.Collection('videos');

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
    Videos.update(videoId, { $inc: { 'stats.likes': 1 } });
    return true;
  },
  'videos.dislike'(videoId) {
    check(videoId, String);
    Videos.update(videoId, { $inc: { 'stats.dislikes': 1 } });
    return true;
  },
});
