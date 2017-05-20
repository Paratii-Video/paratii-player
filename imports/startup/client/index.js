// Import client startup through a single index entry point

import { Meteor } from 'meteor/meteor';

import './routes.js';
import './at_config.js';


AccountsTemplates.configure();

Meteor.startup(function () {
  // delay so we make sure the data is already loaded from the indexedDB
  // TODO improve persistent-minimongo2 ?
  Meteor.setTimeout(function () {
      // connection.init();
  }, 1000);
});
