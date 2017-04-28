import { Template } from 'meteor/templating';

import './info.html';


Template.account_info.helpers({
	user_info_as_string() {
		// for quick inspection
    	return JSON.stringify(Meteor.user());
	},
	user() {
		let user = Meteor.user()
		// user.paratii.account = '1234'
		return user

	},
});