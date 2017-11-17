/***
 Running this script will reset the data on vidoes and playlists.
 This is a DESTRUCTIVE OPERATION: plz use only when you know what you are doing
 DO NOT IMPORT THIS FILE in your meteor code

 Usage: (on the server)
    cat path/to/this/file/resetDb.js | meteor shell

[The reason why this file is under "imports" is because meteor, ironically, imports
 *all @#$%% files* _except_ those in 'imports']
*/
import { installFixture } from '/imports/startup/server/fixtures.js'

function resetDb () {
  console.log('removing all data about videos from the database, and importing fixtures from octobersprintfixture.js')
  // Videos.remove({})
  // Playlists.remove({})
  let fixture = require('/imports/fixtures/octobersprintfixture.js')
  installFixture(fixture)
}

resetDb()
