/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { $ } from 'meteor/jquery';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Factory } from 'meteor/dburles:factory';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Blaze } from 'meteor/blaze';

import { withRenderedTemplate } from '../../../test-helpers.js';
import { Videos } from '../../../../api/videos.js';
import '../player.html';
import '../player.js';
import '../../../layouts/body/body.js';

Factory.define('video', Videos, {});

describe('player page', function () {
  const videoId = '12345';
  const videoTitle = 'Rosencrants and Guildenstern are dead';
  const price = 10;
  beforeEach(function () {
    StubCollections.stub([Videos]);
    Factory.create('video', {
      _id: videoId,
      title: videoTitle,
      price,
    });

    sinon.stub(FlowRouter, 'getParam', () => videoId);
  });

  afterEach(function () {
    StubCollections.restore();
    FlowRouter.getParam.restore();
  });

  it('the video() helper returns the expected video', function () {
    const video = Template.player.__helpers[' video']();
    assert.equal(video._id, videoId);
  });

  it('the hasPrice() helper returns the expected value', function () {
    const value = Template.player.__helpers[' hasPrice']();
    assert.equal(value, true);
  });

  it('the formatNumber() helper returns the number formatted correctly', function () {
    const value = Template.player.__helpers[' formatNumber'](1000);
    assert.equal(value, '1.000');
  });

  it('the formatTime() helper returns the number formatted correctly', function () {
    const value = Template.player.__helpers[' formatTime'](140);
    assert.equal(value, '02:20');
  });

  it('renders correctly with simple data', function () {
    const data = {
    };
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#video-player').length, 1);
    });
  });

  it('playpause helper is working', function () {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const view = Blaze.render(Template.player, el);
    // force Template.instance() to return view.templateInstance
    Template._currentTemplateInstanceFunc = view.templateInstance;
    assert.equal(Template.player.__helpers[' playPause'](), 'play');
  });
});
