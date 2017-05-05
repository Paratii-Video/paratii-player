/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../about.js';

describe('about page', function () {
  it('renders correctly with simple data', function () {
    const data = {}
    withRenderedTemplate('about', data, el => {
      chai.assert.equal($(el).find('.titleContainer').length, 1);
    });
  });
});