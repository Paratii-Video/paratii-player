/* eslint no-console: "off" */

// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor'
import { Videos } from '../../api/videos.js'
import { Playlists } from '../../api/playlists.js'

export const paratiiStartupWelcome = () => {
  console.log('...............................................................................................')
  console.log('...............................................................................................')
  console.log('...............................................................................................')
  console.log('...............................................................................................')
  console.log('....XXX........................................................................................')
  console.log('....XX00XX.....................................................................................')
  console.log('.....XXXX0XX...................................................................................')
  console.log('.....XXXXXXXXXX................................................................................')
  console.log('.....XXXXXXXXX0XX........X0XXXXXX0.....X00X......X0XXXXXX0X......000....XXXX00XXXX...0X...0X...')
  console.log('.....XXXXXXXXXXXXX.......X0......XX...X0.X0......X0X.....X0.....X0.X0.......X0.......0X...0X...')
  console.log('.....XXXXXXXXXXXXXXX.....X0.....X0X...0X..00.....X0X....X0X....X0X..0X......X0.......0X...0X...')
  console.log('.....XXXXXXXXXXXXXXX.....X0..XXXX....0X....0X....X0X.XXX0X.....0X....0X.....X0.......0X...0X...')
  console.log('....XXXXXXXXXXXXX........X0.........X0......0X...X0X....00....0X.....X0.....X0.......0X...0X...')
  console.log('....XXXXXXX..............X0........X0..XXXXX00...X0X.....0X..X0..XXXX000....X0.......0X...0X...')
  console.log('...............................................................................................')
  console.log('...............................................................................................')
  console.log('...............................................................................................')
  console.log('...............................................................................................')
  console.log('...............................................................................................')
}
// Videos
export const populateVideos = () => {
  // we repopulate the video list on each restart
  const videoList = [
    {
      _id: '1',
      title: 'Nature Power - Surf Nature Power',
      description: 'A video about nature, power, surfing and lots of natural power...',
      thumb: '/img/cover/thumb1-img.png',
      duration: '15:30',
      price: 22,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Pole Pole Channel',
        avatar: 'http://i.pravatar.cc/150?img=1'
      },
      stats: {
        likes_percentage: 84,
        views: 15524,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['NATURE'],
      src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
      mimetype: 'video/webm'
    },
    {
      _id: '2',
      title: 'Longboard Northern California Jorney',
      description: 'Longboard Expression Session at NC before the final Pro 2016! Best barrels ever seen in a longboard!!',
      thumb: '/img/cover/thumb2-img.png',
      duration: '03:22',
      price: 0,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'John Doe',
        avatar: 'http://i.pravatar.cc/150?img=2'
      },
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['NATURE', 'LONGBOARDING'],
      src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
      mimetype: 'video/webm'
    },
    {
      _id: '3',
      title: 'Webtorrent  Experiment',
      description: 'Trying with webtorrent...',
      thumb: '/img/cover/thumb2-img.png',
      duration: '03:22',
      price: 22,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Mike Torrent',
        avatar: 'http://i.pravatar.cc/150?img=3'
      },
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['WEBTORRENT', 'FUN AND PROFIT'],
      src: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
      mimetype: 'video/mp4'
    },
    {
      _id: '4',
      title: 'Around the Block - Teaser 1',
      description: 'First teaser of Around the Block ',
      thumb: '/img/cover/teaser1.jpg',
      duration: '03:22',
      price: 0,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Paratii',
        avatar: 'http://i.pravatar.cc/150?img=4'
      },
      stats: {
        likes_percentage: 98,
        views: 100,
        likes: 500,
        dislikes: 7
      },
      tags: ['WEBTORRENT', 'AROUND THE BLOCK'],
      src: 'magnet:?xt=urn:btih:978c3df6e8e3562b18613e36086bf2592093db90&dn=Around+The+Block+Series+-+Teaser+1+-+Sergio+Lerner.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
      mimetype: 'video/mp4'
    },
    {
      _id: '5',
      title: 'Around the Block - Teaser 16',
      description: 'Another teaser of Around the Block ',
      thumb: '/img/cover/teaser16.jpg',
      duration: '03:22',
      price: 14,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Paratii',
        avatar: 'http://i.pravatar.cc/150?img=4'
      },
      stats: {
        likes_percentage: 98,
        views: 100,
        likes: 500,
        dislikes: 7
      },
      tags: ['WEBTORRENT', 'AROUND THE BLOCK'],
      src: 'magnet:?xt=urn:btih:826bfc8069e71418c215179f12546460e3364b5a&dn=Around_The_Block_Teaser_16.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
      mimetype: 'video/mp4'
    },
    {
      _id: '6',
      title: 'Around The Block Series - Teaser 1 - Sergio Lerner',
      description: 'Around the Block is a humane account of the most fascinating social experiment ever played in the internet, in the form of a documentary series. This is just a teaser. Rollout of 6 free episodes begins in Autumn 2017. ',
      thumb: '/img/cover/teaser1.jpg',
      duration: '01:57',
      price: 0,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Paratii',
        avatar: 'http://i.pravatar.cc/150?img=4'
      },
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['IPFS', 'Around The Block'],
      // src: '/ipfs/QmeqDeRWSghNQwheSt6R8bB7wd2tgAo1KYT4VGLsbDdgWx',
      src: 'https://gateway.ipfs.io/ipfs/QmayHsEJfu1Pq5q1k3c9f9z14fh6AyJsam4LFbSQYWMXZt',
      mimetype: 'video/mp4'

    }, {
      _id: '7',
      title: 'Around The Block Series - Teaser 16 - Alex Van De Sande',
      description: 'IPFS EXAMPLE video',
      thumb: '/img/cover/teaser16.jpg',
      duration: '01:46',
      price: 0,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Paratii',
        avatar: 'http://i.pravatar.cc/150?img=4'
      },
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['IPFS', 'Around The Block'],
      // src: '/ipfs/QmR6QvFUBhHQ288VmpHQboqzLmDrrC2fcTUyT4hSMCwFyj',
      src: 'https://gateway.ipfs.io/ipfs/QmcSHvFsGEU36viAkXo5PAkz1YgsorzT5LXR8uAnugJ7Hg',
      mimetype: 'video/mp4'

    }, {
      _id: '8',
      title: '[IPFS] Big Buck Bunny',
      description: 'IPFS EXAMPLE video',
      duration: '01:00',
      price: 0,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Paratii',
        avatar: 'http://i.pravatar.cc/150?img=4'
      },
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['IPFS', 'Fragmented Mp4'],
      src: '/ipfs/QmR6QvFUBhHQ288VmpHQboqzLmDrrC2fcTUyT4hSMCwFyj',
      mimetype: 'video/mp4'
    }, {
      _id: '9',
      title: '[IPFS][browser-optimized] Big Buck Bunny',
      description: 'IPFS EXAMPLE video, NOTE: you have to upload the frag_bunny.mp4 file using the browser uploader to seed this file.',
      duration: '01:00',
      price: 0,
      uploader: {
        address: '0xe19678107410951a9ed1f6906ba4c913eb0e44d4',
        name: 'Paratii',
        avatar: 'http://i.pravatar.cc/150?img=4'
      },
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7
      },
      tags: ['IPFS', 'Fragmented Mp4', 'Browser to Browser stream'],
      src: '/ipfs/Qmb3eFpLCNGg1NrPcY5RcHhznibVGuPT28fzZQ7egTzv37',
      mimetype: 'video/mp4'
    }
  ]

  // if (Videos.find().count() === 0 || Videos.find({ src: v1.src }).count() === 0) {
  Videos.remove({})
  console.log('|'); console.log('|')
  console.log('--> populate video collection')
  _.each(videoList, (video) => {
    Videos.insert(video)
  })
  // }
}

// Playlists
export const populatePlaylist = () => {
  const p1 = {
    _id: '1',
    title: 'Around the block WebTorrent',
    description: 'A super playlist about blockchain!',
    url: 'around-the-block',
    videos: [Videos.find().fetch()[3]._id, Videos.find().fetch()[4]._id]
  }
  const p2 = {
    _id: '2',
    title: 'Around the block IPFS',
    description: 'A super playlist about blockchain!',
    url: 'around-the-block',
    videos: [Videos.find().fetch()[6]._id, Videos.find().fetch()[5]._id, Videos.find().fetch()[7]._id]
  }
  const p3 = {
    _id: '3',
    title: 'Best surf Collection',
    description: 'A collection of surfing’s most inspiring moments of the year, from dogs inside barrels to chasing the big ones in Northern California.',
    url: 'best-surf-colection',
    videos: [Videos.find().fetch()[0]._id, Videos.find().fetch()[1]._id]
  }
  const p4 = {
    _id: '4',
    title: 'Mother Life',
    description: 'A awesome playlist about Nature!',
    url: 'mother-life',
    videos: [Videos.find().fetch()[2]._id, Videos.find().fetch()[7]._id, Videos.find().fetch()[8]._id]
  }

  // if (Playlists.find().count() === 0) {
  Playlists.remove({})
  console.log('--> populate playlists collection')

  let playlistList = [p1, p2, p3, p4]
  _.each(playlistList, (playlist) => {
    Playlists.insert(playlist)
  })
  console.log('--> done.')
}

Meteor.startup(function () {
  paratiiStartupWelcome()
  populateVideos()
  populatePlaylist()
})
