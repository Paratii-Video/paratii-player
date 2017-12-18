// We must import paratii-lib before istantiating web3 while the migration to paratii-lib is ongoing..
var Paratii = require('paratii-lib').Paratii
export let paratii = new Paratii({
  provider: Meteor.settings.public.http_provider
})
