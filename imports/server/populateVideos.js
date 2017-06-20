/* eslint no-console: "off" */
import { Videos } from '/imports/api/videos.js';

export const populateVideos = () => {
  // we repopulate the video list on each restart

  const v1 = {
    id: 1,
    title: 'Nature Power - Surf Nature Power',
    description: 'A video about nature, power, surfing and lots of natural power...',
    thumb: '/img/thumb1-img.png',
    duration: '15:30',
    price: '22',
    uploader: 'Pole Pole Channel',
    stats: {
      likes_percentage: 84,
      views: 15524,
      likes: 2345555,
      dislikes: 7,
    },
    tags: ['NATURE'],
    src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
  };
  if (Videos.find().count() === 0 || Videos.find({ src: v1.src }).count() === 0) {
    Videos.remove({});
    console.log('|'); console.log('|');
    console.log('--> populate video collection');
    const v2 = {
      id: 1,
      title: 'Longboard Northern California Jorney',
      description: 'Longboard Expression Session at NC before the final Pro 2016! Best barrels ever seen in a longboard!!',
      thumb: '/img/thumb2-img.png',
      duration: '03:22',
      price: '',
      uploader: 'John Doe',
      stats: {
        likes_percentage: 98,
        views: 2244245,
        likes: 2345555,
        dislikes: 7,
      },
      tags: ['NATURE', 'LONGBOARDING'],
      src: 'https://raw.githubusercontent.com/Paratii-Video/paratiisite/master/imagens/Paratii_UI_v5_mobile.webm',
    };
    videoList = [v1, v2, v1, v2, v1, v2, v1, v2, v1, v2, v1, v2, v1, v2, v1, v2,
      v1, v2, v1, v2, v1, v2, v1, v2, v1, v2, v1, v2];
    _.each(videoList, (video) => {
      Videos.insert(video);
    });
  }
};
