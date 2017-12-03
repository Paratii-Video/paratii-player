/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, arrow-parens */

import { assert } from 'chai'
import { $ } from 'meteor/jquery'
import { Factory } from 'meteor/dburles:factory'
import { withRenderedTemplate } from '../../../test-helpers.js'
import '../playlists.js'

describe('playlists page', function () {
  it('renders correctly with simple data', function () {
    const data = { title: 'Title of this page' }
    withRenderedTemplate('playlists', data, el => {
      let msg = el.innerHTML
      assert.isAtLeast($(el).find('.internals-header-title').length, 1, msg)
    })
  })

  it('the hasPrice() helper returns the expected value', function () {
    const video = Factory.build('video', {
      _id: '12345',
      title: 'Rosencrantz and Guildenstern are dead',
      price: -10,
      stats: {
        likes: 3141,
        dislikes: 2718
      }
    })
    const value = Template.playlists.__helpers[' hasPrice'](video)
    assert.equal(value, false)
  })

  it('the formatNumber() helper returns the number formatted correctly', function () {
    const value = Template.playlists.__helpers[' formatNumber'](1000)
    assert.equal(value, '1.000')
  })
})
