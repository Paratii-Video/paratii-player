// Server entry point, imports all server code

import '../imports/startup/server';
import '../imports/startup/both';
import '../imports/api/users.js';
import '../imports/api/events.js';

import { populateVideos } from '../imports/server/populateVideos';


Meteor.startup(function () {
  populateVideos();
});
