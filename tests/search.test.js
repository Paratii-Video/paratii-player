
import { createSearchableVideo, resetDb } from './helpers.js'
import { assert } from 'chai'

describe('Search video: ', function () {
  beforeEach(function () {
    browser.url('http:localhost:3000/search')
    server.execute(resetDb)
  })
  afterEach(function () {
  })

  it('search is triggered if user enter a 3 character lenght keyword @watch', function (done) {
    server.execute(createSearchableVideo, '12345', 'this is the video keyword title', 'this is the video keyword description ', 'Uploader keyword name', 'keyword', 0)
    browser.setValue('[name="search"]', 'k')
    let results = browser.elements('.videos-list li')
    console.log(results.value.length)
    assert.equal(results.value.length, 0)

    browser.setValue('[name="search"]', 'ke')
    results = browser.elements('.videos-listli')
    console.log(results.value.length)
    assert.equal(results.value.length, 0)

    browser.setValue('[name="search"]', 'key')
    results = browser.elements('.videos-list li')
    console.log(results.value.length)
    assert.equal(results.value.length, 1)
    done()
  })

  it('search must return some video with matching title', function (done) {
    done()
  })

  it('search must return some video with matching description', function (done) {
    done()
  })

  it('search must return some video with matching uploader name', function (done) {
    done()
  })

  it('search must return some video with matching tags', function (done) {
    done()
  })

  it('search results must sorted by price ascending', function (done) {
    done()
  })

  it('search results must sorted by price descending', function (done) {
    done()
  })

  it('search results must sorted by date ascending', function (done) {
    done()
  })

  it('search results must sorted by date descending', function (done) {
  })
})
