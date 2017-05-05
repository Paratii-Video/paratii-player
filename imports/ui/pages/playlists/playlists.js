import { Template } from 'meteor/templating';

import './playlists.html';

Template.playlists.helpers({
  videos() {
    return [
      {
        id: 1,
        title: 'Nature Power - Surf Nature Power - Surf Nature Power - Surf Nature Power - Surf Nature Power - Surf ',
        thumb: '/img/thumb1-img.png',
        duration: '15:30',
        price: '22',
        stats: {
          likes_percentage: 84,
          views: 15524,
        },
      },
      {
        id: 1,
        title: 'Nature Power - Surf',
        thumb: '/img/thumb2-img.png',
        duration: '15:30',
        price: '333.22',
        stats: {
          likes_percentage: 84,
          views: 15524,
        },
      },
    ]
  },

  formatViews(views){
    return views.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,') + " views";
  }
})