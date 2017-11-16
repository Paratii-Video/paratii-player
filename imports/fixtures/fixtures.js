/* Fill the database and the blockchain with sample data
 if this is a test environment
*/

import { Videos } from '/imports/api/videos.js'
import { Playlists } from '/imports/api/playlists.js'

export function populateMongoDb (fixture) {
  // Playlists
  if (fixture.playlists) {
    Playlists.remove({})
    console.log('populating playlists collection')

    _.each(fixture.playlists, (playlist) => {
      Playlists.insert(playlist)
    })
    console.log('done populating playlist collection')
  // Videos
  }

  if (fixture.videos) {
    console.log('populating video collection')
    Videos.remove({})
    console.log('removed existing videos')
    _.each(fixture.videos, (video) => {
      Videos.insert(video)
    })
    console.log('done populating video collection')
  }
}
