/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

// import { Factory } from 'meteor/dburles:factory';
import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import lightwallet from "eth-lightwallet/dist/lightwallet.js";
import '../create_account.js';

describe('create account', function () {
  beforeEach(function () {
    Template.registerHelper('_', key => key);
  });
  afterEach(function () {
    Template.deregisterHelper('_');
  });
  it('renders correctly with simple data', function () {
    const data = {}
    withRenderedTemplate('create_account', data, el => {
      chai.assert.equal($(el).find('h1').length, 1);
    });
  });
  it('create a wallet', function() {


  });
});