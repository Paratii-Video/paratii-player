/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'chai';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { withRenderedTemplate } from '../../../test-helpers.js';
import '../wallet.js';

describe('wallet', function () {
  it('renders signin form when user is not logged in', function () {
    const data = {}
    withRenderedTemplate('account', data, el => {
       	assert.equal($(el).find('#at-pwd-form').length, 1);
    });
  });
});