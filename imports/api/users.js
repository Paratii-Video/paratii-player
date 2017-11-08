/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
import { Accounts } from 'meteor/accounts-base'
import { check } from 'meteor/check'
import { getKeystore } from '/imports/lib/ethereum/wallet.js'
import { add0x } from '/imports/lib/utils.js'

const Promise = require('bluebird')

// Deny all client-side updates to user documents
Meteor.users.deny({
  update () { return true }
})

if (Meteor.isServer) {
  Meteor.publish('userData', function () {
    if (this.userId) {
      return Meteor.users.find({ _id: this.userId }, {
        fields: {
          stats: 1,
          profile: 1
        }
      })
    }
    this.ready()
    return false
  })
}

if (Meteor.isClient) {
  Meteor.subscribe('userData')
}

if (Meteor.isServer) {
  Meteor.methods({
    'users.create' (options) {
      check(options, Object)
      return Accounts.createUser(options)
    },
    'users.update' (data) {
      check(data, Object)
      // check if email is defined, if it is -> update.
      // TODO campare with old email, if it's different then update
      if (data.email !== undefined) {
        // data['emails.0.address'] = data.email;
        // data['emails.s 0.verified'] = false;
        // delete data.email;

        // save oldEmail address
        const user = Meteor.users.findOne(this.userId)
        const oldEmail = user.emails && user.emails[0] && user.emails[0].address

        // add new email address
        Accounts.addEmail(this.userId, data.email, false)

        if (oldEmail) {
          // remove old email address
          Accounts.removeEmail(this.userId, oldEmail)
        }
      }
      // check if name is defined, if it is -> update.
      // TODO compare with old name, if it's different then update
      if (data.name !== undefined) {
        Meteor.users.update(this.userId, { $set: { 'profile.name': data.name } })
      }

      // TODO campare with old image, if it's different then update
      if (data.avatar !== undefined) {
        Meteor.users.update(this.userId, { $set: { 'profile.image': data.avatar } })
      }
      if (data['profile.ptiAddress']) {
        Meteor.users.update(this.userId, { $set: { 'profile.ptiAddress': data['profile.ptiAddress'] } })
      }
    },
    'users.removeImage' () {
      Meteor.users.update(this.userId, { $unset: { 'profile.image': '' } })
    },
    checkPassword (password) {
      check(password, String)
      if (this.userId) {
        const user = Meteor.user()
        const result = Accounts._checkPassword(user, password)
        return result.error == null // If no error return true
      }
      return false
    }
  })
}

export function userPrettyName () {
  const user = Meteor.user()
  if (user) {
    if (user.profile) {
      return user.profile.name
    }
    return Meteor.userId()
  }
  return ''
}

export function getUserPTIAddress () {
  if (Session.get('generating-keystore')) {
    // keystore is not available yet
    return undefined
  }
  const address = Session.get('userPTIAddress')
  if (address === undefined) {
    const keystore = getKeystore()
    if (keystore !== null) {
      const addresses = keystore.getAddresses()
      if (addresses.length > 0) {
        Session.set('userPTIAddress', add0x(addresses[0]))
        return add0x(addresses[0])
      }
    }
  }
  return address
  // if (keystore !== undefined) {
  //   address = add0x(keystore.ksData[keystore.defaultHdPathString].addresses[0]);
  //   return address;
  // }
  // return undefined;
}

export function checkPassword (password) {
  // check the password, return True if it valid, false otherwise
  return Promise.promisify(Meteor.call)('checkPassword', password)
}
