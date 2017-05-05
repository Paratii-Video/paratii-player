// /* eslint-env mocha */
// /* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../playlists.js';

describe('playlists page', function () {
  it('renders correctly with simple data', function () {
    const data = {}
    withRenderedTemplate('playlists', data, el => {
      chai.assert.isAbove($(el).find('.titleContainer').length, 0);
    });
  });
});