/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai'
import { $ } from 'meteor/jquery'
import StubCollections from 'meteor/hwillson:stub-collections'
import { Factory } from 'meteor/dburles:factory'
import { sinon } from 'meteor/practicalmeteor:sinon'
import { Blaze } from 'meteor/blaze'

import { Videos } from '/imports/api/videos.js'
import { withRenderedTemplate } from '../../../test-helpers.js'
import '../player.html'
import '../player.js'
import '../../../layouts/body/body.js'

Factory.define('video', Videos, {})

describe('player page', function () {
  const videoId = '12345'
  const videoTitle = 'Rosencrantz and Guildenstern are dead'
  const price = 10

  beforeEach(function () {
    StubCollections.stub([Videos])
    Factory.create('video', {
      _id: videoId,
      title: videoTitle,
      price,
      stats: {
        likes: 3141,
        dislikes: 2718
      },
      src: 'https://some.com/source'
    })

    sinon.stub(FlowRouter, 'getParam', () => videoId)
  })

  afterEach(function () {
    StubCollections.restore()
    FlowRouter.getParam.restore()
  })

  it('the video() helper returns the expected video', function () {
    const video = Template.player.__helpers[' video']()
    assert.equal(video._id, videoId)
  })

  it('the hasPrice() helper returns the expected value', function () {
    const value = Template.player.__helpers[' hasPrice']()
    assert.equal(value, true)
  })

  it('the formatNumber() helper returns the number formatted correctly', function () {
    const value = Template.player.__helpers[' formatNumber'](1000)
    assert.equal(value, '1.000')
  })

  it('the formatTime() helper returns the number formatted correctly', function () {
    const value = Template.player.__helpers[' formatTime'](130)
    assert.equal(value, '02:10')
  })

  it('renders correctly with simple data', function () {
    const data = {
    }
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#video-player').length, 1)
    })
  })

  it('increments the likes counter when clicked', function () {
    data = {}
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#button-like').text(), '3.141')
    })
    Template.player.fireEvent('click #button-like')
    // (it is probably easier to write a full-app test, instead of a unittest like this)
    // TODO: this text fails, because there is no logged in user at this point
    // withRenderedTemplate('player', data, (el) => {
    //   assert.equal($(el).find('#button-like').text(), '3.142');
    // });
  })

  it('increments the dislikes counter when clicked', function () {
    data = {}
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#button-dislike').text(), '2.718')
    })
    Template.player.fireEvent('click #button-dislike')
    // TODO: this text fails, because there is no logged in user at this point
    // (it is probably easier to write a full-app test, instead of a unittest like this)
    // withRenderedTemplate('player', data, (el) => {
    //   assert.equal($(el).find('#button-dislike').text(), '2.719');
    // });
  })
})

describe('webtorrent player', function () {
  const videoId = '12345'
  const videoTitle = 'Rosencrantz and Guildenstern are dead'
  const price = 10

  beforeEach(function () {
    StubCollections.stub([Videos])
    Factory.create('video', {
      _id: videoId,
      title: videoTitle,
      price,
      stats: {
        likes: 3141,
        dislikes: 2718
      },
      // src: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
      // src: 'magnet:?x',
      src: '/test/files/SampleVideo_1280x720_1mb.mp4'
    })

    sinon.stub(FlowRouter, 'getParam', () => videoId)
  })

  afterEach(function () {
    StubCollections.restore()
    FlowRouter.getParam.restore()
  })

  it('renders correctly with simple data', function () {
    const data = {
    }
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#video-player').length, 1)
    })
  })
})

describe('player helpers', function () {
  beforeEach(function () {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const view = Blaze.render(Template.player, el)
    Template._currentTemplateInstanceFunc = view.templateInstance
  })

  it('playpause helper is working', function () {
    assert.equal(Template.player.__helpers[' playPause'](), 'play')
  })

  it('playPauseIcon returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' playPauseIcon'](), '/img/play-icon.svg')
  })

  it('currentTime returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' currentTime'](), 0)
  })

  it('totalTime returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' totalTime'](), 0)
  })

  it('hideControls returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' hideControls'](), '')
  })

  it('volumeClass returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' volumeClass'](), 'closed')
  })

  it('playedProgress returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' playedProgress'](), 0)
  })

  it('loadedProgress returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' loadedProgress'](), 0)
  })

  it('scrubberTranslate returns the expected initial value', function () {
    assert.equal(Template.player.__helpers[' scrubberTranslate'](), 0)
  })
})

describe('player events', function () {
  beforeEach(function () {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const view = Blaze.render(Template.player, el)
    Template._currentTemplateInstanceFunc = view.templateInstance
  })

  // it('video ended changes playing state', function () {
  //   const el = document.createElement('div');
  //   document.body.appendChild(el);
  //   const view = Blaze.render(Template.player, el);
  //   Template._currentTemplateInstanceFunc = view.templateInstance;
  //   Template.player.fireEvent('ended #video-player',
  //      { templateInstance: view.templateInstance });
  //   assert(Template.player.__helpers[' playPause'](), 'play');
  //   assert(Template.player.__helpers[' playPauseIcon'](), '/img/play-icon.svg');
  // });
  //
  // it('playing state changes when play button is clicked', function () {
  //   Template.player.fireEvent('click #play-pause-button');
  //   assert(Template.player.__helpers[' playPause'](), 'pause');
  //   assert(Template.player.__helpers[' hideControls'](), 'toggleFade');
  //   assert(Template.player.__helpers[' playPauseIcon'](), '/img/pause-icon.svg');
  // });
})
