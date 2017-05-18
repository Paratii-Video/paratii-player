/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { $ } from 'meteor/jquery';
import { withRenderedTemplate } from '/imports/ui/test-helpers.js';
import '../player.js';
import '../../../layouts/body/body.js';
import '/lib/collections.js'


describe('player page', function () {
  it('renders correctly with simple data', function () {
    const data = {
    };
    FlowRouter.setParams({_id: "1234"})
    withRenderedTemplate('player', data, (el) => {
      // chai.assert.equal($(el).find('#video-player').length, 1);
    });
  });
});
