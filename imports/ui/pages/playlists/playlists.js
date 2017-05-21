import { Template } from 'meteor/templating';
import { Videos } from '../../../../imports/api/videos.js';

import './playlists.html';

Template.playlists.helpers({
  videos() {
    const videos = Videos.find();
    return videos;
  },
  hasPrice(video) {
    return video && video.price && video.price > 0;
  },
  formatNumber(number) {
    /*
      Add check if number is not defiend
    */
    if (!number) {
      return false;
    }
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  },
});
