// Import client startup through a single index entry point

import { Meteor } from 'meteor/meteor'
import './routes.js'
import { paratii } from '/imports/lib/ethereum/paratii.js'
import { initConnection } from '../../lib/ethereum/connection.js'

Meteor.setTimeout(function () { initConnection() }, 1000)
