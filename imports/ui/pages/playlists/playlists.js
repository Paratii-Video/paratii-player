import { Template } from 'meteor/templating';
import { Videos } from '../../../../imports/api/videos.js';

import './playlists.html';
// Template.playlists.onCreated(function bodyOnCreated() {
//   Meteor.subscribe('videos');
// });

Template.playlists.helpers({
  videos() {
    const videos = Videos.find();
    return videos;
  },

  formatNumber(number) {
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  },
});
