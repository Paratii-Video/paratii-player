
import { createSearchableVideo, resetDb } from './helpers.js'

describe('Search video: ', function () {
  beforeEach(function () {
    browser.url('http:localhost:3000/search')
    server.execute(createSearchableVideo, 1, 'this is the video keyword title', 'this is the video keyword description ', 'Uploader keyword name', 'keyword', 0)
  })
  afterEach(function () {
    server.execute(resetDb)
  })

  it('search is triggered if user enter a 3 character lenght keyword @watch', function (done) {
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
