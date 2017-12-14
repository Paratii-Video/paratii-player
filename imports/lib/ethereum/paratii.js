// We must import paratii-lib before istantiating web3 while the migration to paratii-lib is ongoing..
var Paratii = require('paratii-lib').Paratii

console.log(Meteor.settings.public.http_provider)
console.log(Meteor.settings.public.ParatiiRegistry)
export var paratii = new Paratii({
  provider: Meteor.settings.public.http_provider
})
