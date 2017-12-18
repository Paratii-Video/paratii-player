// We must import paratii-lib before istantiating web3 while the migration to paratii-lib is ongoing..
var Paratii = require('paratii-lib').Paratii

console.log('current provider', Meteor.settings.public.http_provider)
let address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'

export let paratii = new Paratii({
  address: address,
  provider: Meteor.settings.public.http_provider
})
