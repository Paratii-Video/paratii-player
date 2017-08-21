import { Template } from 'meteor/templating';
import { formatNumber } from '/imports/lib/utils.js';
import { Videos } from '../../../../imports/api/videos.js';
import { getUserPTIAddress } from '/imports/api/users.js';
import './playlists.html';

const userAddress = getUserPTIAddress();

Template.playlists.onCreated(function () {
  Meteor.subscribe('videos' );
});

Template.playlists.helpers({
  videos() {
    const videos = Videos.find();
    return videos;
  },
  hasPrice(video) {
    return video && video.price && video.price > 0;
  },
  formatNumber(number) {
    return formatNumber(number);
  },
});
