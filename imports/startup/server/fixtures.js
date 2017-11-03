/* Fill the database and the blockchain with sample data
 if this is a test environment
*/

import { Meteor } from 'meteor/meteor'
import { Videos } from '../../api/videos.js'
import { Playlists } from '../../api/playlists.js'
import { deployParatiiContracts } from '/imports/lib/ethereum/helpers.js'
import { watchEvents } from '/imports/api/transactions.js'
import { getParatiiContracts, setRegistryAddress } from '/imports/lib/ethereum/contracts.js'
import { web3 } from '/imports/lib/ethereum/web3.js'

async function populateMongoDb (fixture) {
  // Videos
  const populateVideos = (videos) => {
    Videos.remove({})
    console.log('|'); console.log('|')
    console.log('--> populate video collection')
    _.each(videos, (video) => {
      Videos.insert(video)
    })
  }

  // Playlists
  const populatePlaylist = (playlists) => {
    Playlists.remove({})
    console.log('--> populate playlists collection')

    _.each(playlists, (playlist) => {
      Playlists.insert(playlist)
    })
    console.log('--> done.')
  }
  populateVideos(fixture.videos)
  populatePlaylist(fixture.playlists)
}

export async function installFixture (fixture) {
  let contracts = await getParatiiContracts()
  for (let i = 0; i < fixture.videos.length; i++) {
    let video = fixture.videos[i]
    await contracts.VideoRegistry.registerVideo(String(video._id), video.uploader.address, Number(web3.toWei(video.price)), {from: web3.eth.accounts[0]})
    console.log(`registered video ${video._id} with price ${web3.toWei(video.price)} and owner ${video.uploader.address}`)
  }
  populateMongoDb(fixture)
}

export async function deployContractsAndInstallFixture (fixture) {
  console.log('Test environment: deploying contracts on startup')
  try {
    let contracts = await deployParatiiContracts()

    await contracts.ParatiiRegistry.registerNumber('VideoRedistributionPoolShare', web3.toWei(0.3), {from: web3.eth.accounts[0]})
    await contracts.ParatiiAvatar.addToWhitelist(contracts.VideoStore.address, {from: web3.eth.accounts[0]})

    console.log('done installing contracts!')
    setRegistryAddress(contracts.ParatiiRegistry.address)
    installFixture(fixture)
    return contracts
  } catch (error) {
    // log the errors, otherwise they will just be ignored by useful meteor
    console.log(error)
    throw error
  }
}

if (Meteor.settings.public.isTestEnv) {
  // if we are in a test environment, we will deploy the contracts before starting to watch
  // we can do all this easily, because accounts[0] is unlocked in testrpc, and has lots of Ether.
  let testFixture = require('/imports/fixtures/testFixture.js')
  deployContractsAndInstallFixture(testFixture).then(function (contracts) {
    setRegistryAddress(contracts.ParatiiRegistry.address)
    Meteor.startup(
      function () {
        watchEvents()
      }
    )
  })

  // Meteor.startup(function () {
  //   populateMongoDb(testFixture)
  // })
}
