// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';
import '../imports/api/users.js';

import { populateVideos } from '/imports/server/populateVideos'

Meteor.startup(function () {

  console.log("Starting the app... ")

  populateVideos()

});
