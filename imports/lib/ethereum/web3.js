// We must import paratii-lib before istantiating web3 while the migration to paratii-lib is ongoing..
export var Paratii = require('paratii-lib').Paratii

var Web3 = require('web3')
export var web3 = new Web3()
