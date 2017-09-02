import { check } from 'meteor/check';

export const Playlists = new Mongo.Collection('playlists');

if (Meteor.isServer) {
  Meteor.publish('playlists', function() {
    return Playlists.find();
  });
}
