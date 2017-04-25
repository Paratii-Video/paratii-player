import { Template } from 'meteor/templating';

import './user_info.html';


Template.user_info.helpers({
	user_info_as_string() {
		// for quick inspection
    	return JSON.stringify(Meteor.user());
	},
});