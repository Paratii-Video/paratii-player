// Import client startup through a single index entry point

import { Meteor } from 'meteor/meteor';

import './routes.js';
import './at_config.js';
import { initConnection } from '../../lib/ethereum/connection.js';
// import { initIPFS } from '../../lib/ipfs/index.js'
// import '../../lib/ipfs/mp4box.js'

Meteor.setTimeout(function () {
  initConnection();
  // IPFS integration.
  // initIPFS(() => {
  //   console.log('ipfs initiated.')
  // })

}, 1000);
