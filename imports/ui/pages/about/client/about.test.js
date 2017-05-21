/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../about.js';

describe('about page', function () {
  it('renders correctly with simple data', function () {
    const data = {};
    withRenderedTemplate('about', data, (el) => {
      assert.isAtLeast($(el).find('.titleContainer').length, 1);
    });
  });
});
