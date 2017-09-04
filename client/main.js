// Client entry point, imports all client code

import '/imports/startup/client'
import '/imports/startup/both'

global.Buffer = global.Buffer || require('buffer').Buffer
