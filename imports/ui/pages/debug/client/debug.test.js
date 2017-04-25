/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

// import { Factory } from 'meteor/dburles:factory';
import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '../../../test-helpers.js';
import '../debug.js';

describe('debug page', function () {
  beforeEach(function () {
    Template.registerHelper('_', key => key);
  });
  afterEach(function () {
    Template.deregisterHelper('_');
  });
  it('renders correctly with simple data', function () {
    // const todo = Factory.build('todo', { checked: false });
    // const data = {
    //   todo: Todos._transform(todo),
    //   onEditingChange: () => 0,
    // };
    const data = {}
    withRenderedTemplate('debug', data, el => {
      chai.assert.equal($(el).find('h1').length, 1);
    });
  });
});