/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../account.js';

describe('account', function () {
  it('renders signin form when user is not logged in', function () {
    const data = {}
    withRenderedTemplate('account', data, el => {
      chai.assert.equal($(el).find('#at-pwd-form').length, 1);
    });
  });
  it('create a wallet', function() {


  });
});