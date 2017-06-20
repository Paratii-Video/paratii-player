/* eslint global-require: "off" */

import { assert } from 'chai';


function createVideo() {
  let video;
  video = {
    id: '12345',
    title: 'Rosencrantz and Guildenstern are dead',
    price: 10,
    src: 'https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4',
    mimetype: 'video/mp4',
    stats: {
      likes: 150,
      dislikes: 10,
    },
  };
  Meteor.call('videos.create', video);
  video = {
    id: '12346',
    title: 'Rosencrantz and Guildenstern are dead II',
    price: 10,
    src: 'https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4',
    mimetype: 'video/mp4',
    stats: {
      likes: 150,
      dislikes: 10,
    },
  };
  Meteor.call('videos.create', video);
}

function removeVideo() {
  const { Videos } = require('/imports/api/videos');
  Videos.remove({ _id: '12345' });
  Videos.remove({ _id: '12346' });
}

describe('player workflow', function () {
  beforeEach(function () {
    server.execute(createVideo);
  });
  afterEach(function () {
    server.execute(removeVideo);
  });

  it('play the video', function () {
    browser.url('http://localhost:3000/player/12345');
    browser.waitForExist('#video-player');
    browser.click('#play-pause-button');
    assert.isTrue(browser.getAttribute('#nav', 'class').includes('closed'));
    assert.isTrue(browser.getAttribute('.player-controls', 'class').includes('pause'));
    assert.isTrue(browser.getAttribute('.player-overlay', 'class').includes('pause'));
  });

  it('click on the progress bar', function () {
    browser.url('http://localhost:3000/player/12345');
    browser.waitForExist('#video-player');
    browser.waitForExist('#loaded-bar');
    browser.waitUntil(() => browser.getElementSize('#loaded-bar', 'width') > 30, 5000, 'video load timeout');
    browser.click('#loaded-bar');
    browser.pause(200);
    assert.notEqual(browser.getText('#current-time'), '00:00');
    assert.isAbove(browser.getElementSize('#played-bar', 'width'), 0);
    assert.isAbove(browser.getLocation('#scrubber', 'x'), 0);
  });
});
