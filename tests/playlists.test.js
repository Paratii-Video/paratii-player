import { resetDb, clearLocalStorage, createUserAndLogin } from './helpers.js'

function createVideo (price) {
  const video = {
    id: '12345',
    title: 'Rosencrantz and Guildenstern are dead',
    price: price,
    src: '/test/files/SampleVideo_1280x720_1mb.mp4',
    mimetype: 'video/mp4',
    stats: {
      likes: 150,
      dislikes: 10
    }
  }
  Meteor.call('videos.create', video)
}

function createPlaylist () {
  const playlist = {
    id: '98765',
    title: 'Around the block IPFS',
    description: 'A super playlist about blockchain!',
    url: 'around-the-block',
    videos: ['12345']
  }
  Meteor.call('playlists.create', playlist)
}

function fakeVideoUnlock (address) {
  // TODO: this function need to call the Contract instead of insert the transactin in Mongo
  // const transaction = {
  //   from: address,
  //   _id: '5000',
  //   videoid: '12345',
  //   blockNumber: 1
  // }
  // const { Transactions } = require('/imports/api/transactions')
  // Transactions.insert(transaction)
}

describe('price tag status', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000/')
    server.execute(resetDb)
  })

  afterEach(function () {
    browser.execute(clearLocalStorage)
  })

  it('when the video has no price', () => {
    createUserAndLogin(browser)
    server.execute(createVideo, 0)
    server.execute(createPlaylist)
    browser.url('http:localhost:3000/playlists/98765')
    browser.waitForExist('.videoCardContainer', 2000)

    // .videoCardPrice should not exists
    const priceTag = browser.waitForExist('.videoCardPrice', null, true)
    assert.isTrue(priceTag)
  })

  it('when the video has a price  and wasn\'t bought', () => {
    createUserAndLogin(browser)
    server.execute(createVideo, 10)
    server.execute(createPlaylist)
    browser.url('http:localhost:3000/playlists/98765')
    browser.waitForExist('.videoCardContainer', 2000)
    assert.equal(browser.getText('.videoCardPrice'), '10 PTI')
  })

  it('when the video was bought @watch [TODO]', () => {
    createUserAndLogin(browser)
    browser.waitForVisible('#public_address', 5000)
    const address = browser.getText('#public_address')
    server.execute(createVideo, 10)
    server.execute(createPlaylist)
    server.execute(fakeVideoUnlock, address)
    browser.url('http:localhost:3000/playlists/98765')
    browser.waitForExist('.videoCardContainer', 2000)
    // assert.equal(browser.getText('.videoCardPrice'), '✓')
  })
})
