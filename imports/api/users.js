/* eslint-disable no-param-reassign, no-alert */

import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Session } from 'meteor/session';
import { createWallet } from '/imports/lib/ethereum/wallet.js';


// Deny all client-side updates to user documents
Meteor.users.deny({
  update() { return true; },
});

if (Meteor.isServer) {
  Meteor.publish('userData', function () {
    if (this.userId) {
      return Meteor.users.find({ _id: this.userId }, {
        fields: {
          stats: 1,
          profile: 1,
        },
      });
    }
    this.ready();
    return false;
  });
}

if (Meteor.isClient) {
  Meteor.subscribe('userData');
}

Meteor.methods({
  'users.create'(options) {
    check(options, Object);
    // here new wallet is create using user password for keystore encryption
    return Accounts.createUser(options);
  },
  'users.update'(data) {
    check(data, Object);
      // check if email is defined, if it is -> update.
      // TODO campare with old email, if it's different then update

    if (data.email !== undefined) {
        // data['emails.0.address'] = data.email;
        // data['emails.s 0.verified'] = false;
        // delete data.email;

        // save oldEmail address
      const oldEmail = Meteor.users.findOne(this.userId).emails[0].address;
        // remove old email address
      Accounts.removeEmail(this.userId, oldEmail);
        // add new email address
      Accounts.addEmail(this.userId, data.email, false);
    }
      // check if name is defined, if it is -> update.
      // TODO compare with old name, if it's different then update
    if (data.name !== undefined) {
      Meteor.users.update(this.userId, { $set: { 'profile.name': data.name } });
    }

      // TODO campare with old image, if it's different then update
    if (data.avatar !== undefined) {
      Meteor.users.update(this.userId, { $set: { 'profile.image': data.avatar } });
    }
    if (data['profile.ptiAddress']) {
      Meteor.users.update(this.userId, { $set: { 'profile.ptiAddress': data['profile.ptiAddress'] } });
    }
  },
  'users.removeImage'() {
    Meteor.users.update(this.userId, { $unset: { 'profile.image': '' } });
  },
  checkPassword(digest) {
    check(digest, String);
    if (this.userId) {
      const user = Meteor.user();
      const password = { digest, algorithm: 'sha-256' };
      const result = Accounts._checkPassword(user, password);
      return result.error == null;
    }
    return false;
  },
});

if (Meteor.isClient) {
  Accounts.onLogout(function () {
    // remove the information on the current Account from the session
    Session.set('ethAccount', { });
  });
}


export function userPrettyName() {
  const user = Meteor.user();
  if (user) {
    if (user.profile) {
      return user.profile.name;
    }
    return Meteor.userId();
  }
  return '';
}

export function getUserPTIaddress() {
  const user = Meteor.user();
  if (user) {
    if (user.profile) {
      return user.profile.ptiAddress;
    }
  }
  return '';
}

export async function getPassword() {
  const password = prompt('Please enter password', 'Password');
  const digest = Package.sha.SHA256(password);
  await Meteor.call('checkPassword', digest);
  return password;
}
