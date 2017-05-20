/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';

import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../account.js';

describe('account', function () {
  it('renders signin form when user is not logged in', function () {
    const data = {}
    withRenderedTemplate('account', data, el => {
       assert.equal($(el).find('#at-pwd-form').length, 1);
    });
  });
  it('create a wallet', function() {


  });
  it('changes name and email on form submit', function() {
  			
  })
});