// Import modules used by both client and server through a single index entry point
// e.g. useraccounts configuration file.
import { web3 } from '/imports/lib/ethereum/web3.js'
global.web3 = web3
