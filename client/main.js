// Client entry point, imports all client code

import '/imports/startup/client'
import '/imports/startup/both'

global.Buffer = global.Buffer || require('buffer').Buffer
Meteor.startup(function () {
  if (Meteor.settings.public.isTestEnv) {
    Meteor.call('getRegistryAddress', function (error, result) {
      if (error) {
        throw error
      }
      console.log('setting Meteor.settings.public.ParatiiRegistry on testenv to', result)
      Meteor.settings.public.ParatiiRegistry = result
    })
  }
})
