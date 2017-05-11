// /* eslint-env mocha */
// /* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../player.js';
import '../../../layouts/body/body.js';

describe('player page', function () {
  it('renders correctly with simple data', function () {
    const navState = 'minimized';
    const data = { navState };
    withRenderedTemplate('player', data, (el) => {
      chai.assert.equal($(el).find('#video-player').length, 1);
    });
  });
});
