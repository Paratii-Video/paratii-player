import { assert } from 'chai'
import { createVideo, resetDb, createPlaylist } from './helpers.js'

describe('player workflow @watch', function () {
  afterEach(function () {
    server.execute(resetDb)
  })

  it('play a free video', function () {
    server.execute(createVideo, '12345', 'Test 1', 0)
    browser.url('http://localhost:3000/play/12345')
    browser.waitForExist('#video-player')
    browser.waitForExist('.player-overlay')
    browser.waitForExist('.player-controls')
    assert.equal(browser.getText('.player-title'), 'Test 1')
    browser.click('#play-pause-button')
    assert.isTrue(browser.getAttribute('#nav', 'class').includes('closed'))
    assert.isTrue(browser.getAttribute('.player-controls', 'class').includes('pause'))
    assert.isTrue(browser.getAttribute('.player-overlay', 'class').includes('pause'))
  })

  it('click on the progress bar', function () {
    server.execute(createVideo, '12345', 'Test 1', 0)
    browser.url('http://localhost:3000/play/12345')
    browser.waitForExist('#video-player')
    // browser.waitForExist('#loaded-bar')
    // browser.waitUntil(() => browser.getElementSize('#loaded-bar', 'width') > 30, 5000, 'video load timeout')
    // browser.click('#loaded-bar')
    // browser.pause(500)
    // assert.notEqual(browser.getText('#current-time'), '00:00')
    // assert.isAbove(browser.getElementSize('#played-bar', 'width'), 0)
    // assert.isAbove(browser.getLocation('#scrubber', 'x'), 0)
  })

  it('click on next video', () => {
    server.execute(createVideo, '12345', 'Test 1', 0)
    server.execute(createVideo, '23456', 'Test 2', 0)
    server.execute(createPlaylist, '98765', 'Playlist test', ['12345', '23456'])
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 1')
    browser.waitForExist('#next-video-button')
    browser.click('#next-video-button')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 2')
  })

  it('click on previous video', () => {
    server.execute(createVideo, '12345', 'Test 1', 0)
    server.execute(createVideo, '23456', 'Test 2', 0)
    server.execute(createPlaylist, '98765', 'Playlist test', ['12345', '23456'])
    browser.url('http://localhost:3000/play/12345?playlist=98765')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 1')
    browser.waitForExist('#previous-video-button')
    browser.click('#previous-video-button')
    browser.waitForExist('.player-overlay')
    assert.equal(browser.getText('.player-title'), 'Test 2')
  })
})
