/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { $ } from 'meteor/jquery';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Factory } from 'meteor/dburles:factory';
import { sinon } from 'meteor/practicalmeteor:sinon';

import { withRenderedTemplate } from '../../../test-helpers.js';
import { Videos } from '../../../../api/videos.js';
import '../player.html';
import '../player.js';
import '../../../layouts/body/body.js';

Factory.define('video', Videos, {});

describe('player page', function () {
  const videoId = '12345';
  const videoTitle = 'Rosencrants and Guildenstern are dead';

  beforeEach(function () {
    StubCollections.stub([Videos]);
    Factory.create('video', {
      _id: videoId,
      title: videoTitle,
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

  it('renders correctly with simple data', function () {
    const data = {
    };
    withRenderedTemplate('player', data, (el) => {
      assert.equal($(el).find('#video-player').length, 1);
    });
  });
});
