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
    Videos.update(videoId, { $inc: { 'stats.likes': 1 } });
  },
  'videos.dislike'(videoId) {
    check(videoId, String);
    Videos.update(videoId, { $inc: { 'stats.dislikes': 1 } });
  },
});
