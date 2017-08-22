/* eslint no-console: "off" */

// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Videos } from '../../api/videos.js';
import { Playlists } from '../../api/playlists.js';


// Videos
export const populateVideos = () => {
  // we repopulate the video list on each restart

  const v1 = {
    title: 'Nature Power - Surf Nature Power',
    description: 'A video about nature, power, surfing and lots of natural power...',
    thumb: '/img/thumb1-img.png',
    duration: '15:30',
    price: 22,
    uploader: {
      address : '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
      name: 'Pole Pole Channel',
      avatar: 'http://i.pravatar.cc/150?img=1'
    },
    stats: {
      likes_percentage: 84,
      views: 15524,
      likes: 2345555,
      dislikes: 7,
    },
    tags: ['NATURE'],
    src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
    mimetype: 'video/webm',
  };

  const v2 = {
    title: 'Longboard Northern California Jorney',
    description: 'Longboard Expression Session at NC before the final Pro 2016! Best barrels ever seen in a longboard!!',
    thumb: '/img/thumb2-img.png',
    duration: '03:22',
    price: 0,
    uploader: {
      name: 'John Doe',
      avatar: 'http://i.pravatar.cc/150?img=2'
    },
    stats: {
      likes_percentage: 98,
      views: 2244245,
      likes: 2345555,
      dislikes: 7,
    },
    tags: ['NATURE', 'LONGBOARDING'],
    src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
    mimetype: 'video/webm',
  };

  const v3 = {
    title: 'Webtorrent  Experiment',
    description: 'Trying with webtorrent...',
    thumb: '/img/thumb2-img.png',
    duration: '03:22',
    price: 22,
    uploader: {
      name: 'Mike Torrent',
      avatar: 'http://i.pravatar.cc/150?img=3'
    },
    stats: {
      likes_percentage: 98,
      views: 2244245,
      likes: 2345555,
      dislikes: 7,
    },
    tags: ['WEBTORRENT', 'FUN AND PROFIT'],
    src: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
    mimetype: 'video/mp4',
  };

  const v4 = {
    title: 'Around the Block - Teaser 1',
    description: 'First teaser of Around the Block ',
    thumb: '/img/thumb2-img.png',
    duration: '03:22',
    price: '',
    uploader: {
      name: 'Paratii',
      avatar: 'http://i.pravatar.cc/150?img=4'
    },
    stats: {
      likes_percentage: 98,
      views: 100,
      likes: 500,
      dislikes: 7,
    },
    tags: ['WEBTORRENT', 'AROUND THE BLOCK'],
    src: 'magnet:?xt=urn:btih:978c3df6e8e3562b18613e36086bf2592093db90&dn=Around+The+Block+Series+-+Teaser+1+-+Sergio+Lerner.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
    mimetype: 'video/mp4',
  };


  if (Videos.find().count() === 0 || Videos.find({ src: v1.src }).count() === 0) {
    Videos.remove({});
    console.log('|'); console.log('|');
    console.log('--> populate video collection');

    videoList = [v1, v2, v3, v4];
    _.each(videoList, (video) => {
      Videos.insert(video);
    });
  }
};


// Playlists
export const populatePlaylist = () => {
  const p1 = {
    title: 'Around the block',
    description: 'A super playlist about blockchain!',
    url: 'around-the-block',
    videos: [ Videos.find().fetch()[2]._id, Videos.find().fetch()[3]._id]
  };
  const p2 = {
    title: 'Best surf Collection',
    description: 'A collection of surfing’s most inspiring moments of the year, from dogs inside barrels to chasing the big ones in Northern California.',
    url: 'best-surf-colection',
    videos: [ Videos.find().fetch()[0]._id, Videos.find().fetch()[1]._id]
  };
  const p3 = {
    title: 'Mother Life',
    description: 'A awesome playlist about Nature!',
    url: 'mother-life',
    videos: [ Videos.find().fetch()[2]._id]
  };

  if (Playlists.find().count() === 0) {
    Playlists.remove({});
    console.log('|'); console.log('|');
    console.log('--> populate playlits collection');

    playlistList = [p1, p2, p3];
    _.each(playlistList, (playlist) => {
      Playlists.insert(playlist);
    });
  }

};

Meteor.startup(function () {
  populateVideos();
  populatePlaylist();
});
