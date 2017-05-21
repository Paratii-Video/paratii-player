/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, arrow-parens */

import { assert } from 'chai';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../playlists.js';

describe('playlists page', function () {
  it('renders correctly with simple data', function () {
    const data = {};
    withRenderedTemplate('playlists', data, el => {
      assert.isAtLeast($(el).find('.titleContainer').length, 1);
    });
  });
});
