/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { withRenderedTemplate } from '../../../test-helpers.js';

import '../debug.js';

describe('debug page', function () {
  it('renders correctly with simple data', function () {
    const data = {}
    withRenderedTemplate('debug', data, el => {
       	assert.equal($(el).find('h1').length, 1);
    });
  });
});