/* eslint-disable no-param-reassign, no-alert */

import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Session } from 'meteor/session';


if (Meteor.isServer) {
  Meteor.methods({
    'users.create'(options) {
      check(options, Object);
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
      // TODO campare with old name, if it's different then update
      if (data.name !== undefined) {
        Meteor.users.update({ _id: this.userId }, { $set: { 'profile.name': data.name } });
      }
      // Meteor.users.update(userId, { $set: data });
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
}

Accounts.onLogout(function () {
  // remove the information on the current Account from the session
  Session.set('ethAccount', { });
});


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

export function getUserPTIaddress(){
  const user = Meteor.user();
  if (user) {
    if (user.profile) {
      return user.profile.ptiAddress;
    }
    return Meteor.userId();
  }
  else{
    return Meteor.users.findOne({ _id: Meteor.userId });
  }
  return '';
}

export async function getPassword() {
  const password = prompt('Please enter password', 'Password');
  const digest = Package.sha.SHA256(password);
  const result = await Meteor.call('checkPassword', digest);
  if (result) {
    return password;
  }
  alert('This password is not valid');
  return false;
}
