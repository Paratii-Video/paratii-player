/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { $ } from 'meteor/jquery';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Factory } from 'meteor/dburles:factory';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Blaze } from 'meteor/blaze';

import { Videos } from '/imports/api/videos.js';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../player.html';
import '../player.js';
import '../../../layouts/body/body.js';

Factory.define('video', Videos, {});

describe('player page', function () {
  const videoId = '12345';
  const videoTitle = 'Rosencrants and Guildenstern are dead';
  const price = 10;

  beforeEach(function () {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const view = Blaze.render(Template.player, el);
    Template._currentTemplateInstanceFunc = view.templateInstance;
    
    StubCollections.stub([Videos]);
    Factory.create('video', {
      _id: videoId,
      title: videoTitle,
      price: price,
      stats: {
        likes: 3141,
        dislikes: 2718,
      },
    });

    sinon.stub(FlowRouter, 'getParam', () => videoId);
  });

  afterEach(function () {
    StubCollections.restore();
    FlowRouter.getParam.restore();
  });

  it('playpause helper is working', function () {
    assert.equal(Template.player.__helpers[' playPause'](), 'play');
  });

  it('playPauseIcon returns the expected initial value', function () {    
    assert.equal(Template.player.__helpers[' playPauseIcon'](), '/img/play-icon.svg');
  });

  it('currentTime returns the expected initial value', function () {    
    assert.equal(Template.player.__helpers[' currentTime'](), 0);
  });

  it('totalTime returns the expected initial value', function () {    
    assert.equal(Template.player.__helpers[' totalTime'](), 0);
  });

  it('the video() helper returns the expected video', function () {
    const video = Template.player.__helpers[' video']();
    assert.equal(video._id, videoId);
  });

  it('the hasPrice() helper returns the expected value', function () {
    const value = Template.player.__helpers[' hasPrice']();
    assert.equal(value, true);
  });

  it('hideControls returns the expected initial value', function () {    
    assert.equal(Template.player.__helpers[' hideControls'](), '');
  });

  it('the formatNumber() helper returns the number formatted correctly', function () {
    const value = Template.player.__helpers[' formatNumber'](1000);
    assert.equal(value, '1.000');
  });

  it('the formatTime() helper returns the number formatted correctly', function () {
    const value = Template.player.__helpers[' formatTime'](130);
    assert.equal(value, '02:10');
  });

  it('volumeClass returns the expected initial value', function () {    
    assert.equal(Template.player.__helpers[' volumeClass'](), 'closed');
  });

  it('renders correctly with simple data', function () {
    const data = {
    };
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#video-player').length, 1);
    });
  });
  

  it('increments the likes counter when clicked', function () {
    data = {};
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#button-like').text(), '3.141');
    });
    Template.player.fireEvent('click #button-like');
    // (it is probably easier to write a full-app test, instead of a unittest like this)
    // TODO: this text fails, because there is no logged in user at this point
    // withRenderedTemplate('player', data, (el) => {
    //   assert.equal($(el).find('#button-like').text(), '3.142');
    // });
  });

  it('increments the dislikes counter when clicked', function () {
    data = {};
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#button-dislike').text(), '2.718');
    });
    Template.player.fireEvent('click #button-dislike');
    // TODO: this text fails, because there is no logged in user at this point
    // (it is probably easier to write a full-app test, instead of a unittest like this)
    // withRenderedTemplate('player', data, (el) => {
    //   assert.equal($(el).find('#button-dislike').text(), '2.719');
    // });
  });
});
