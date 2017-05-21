/* eslint no-param-reassign: "off" */

import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

Meteor.methods({
  'users.create'(options) {
    check(options, Object);
    return Accounts.createUser(options);
  },
  'users.update'(data) {
    Meteor.userId();
    check(data, Object);
    if (data.email !== undefined) {
      data['emails.0.address'] = data.email;
      data['emails.0.verified'] = false;
      delete data.email;
    }
    Meteor.users.update(userId, { $set: data });
  },
});
