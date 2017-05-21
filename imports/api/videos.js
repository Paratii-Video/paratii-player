export const Videos = new Mongo.Collection('videos');

// if (Meteor.isServer) {
//   // This code only runs on the server
//   Meteor.publish('videos', function tasksPublication() {
//     return Videos.find();
//   });
// }
