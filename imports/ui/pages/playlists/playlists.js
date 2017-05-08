import { Template } from 'meteor/templating';

import './playlists.html';

Template.playlists.helpers({
  videos() {

    const v1 = {
      id: 1,
      title: 'Nature Power - Surf Nature Power',
      thumb: '/img/thumb1-img.png',
      duration: '15:30',
      price: '22',
      stats: {
        likes_percentage: 84,
        views: 15524,
      },
    };
    const v2 = {
      id: 1,
      title: 'Longboard Northern California Jorney',
      thumb: '/img/thumb2-img.png',
      duration: '03:22',
      price: '',
      stats: {
        likes_percentage: 98,
        views: 2244245,
      },
    }

    return [v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2,v1,v2];
  },

  formatNumber(number){
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
})