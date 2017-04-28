import { Template } from 'meteor/templating';

import './playlists.html';

Template.playlists.helpers({
	videos() {
		return [
			{
				id: 1,
				title: 'Nature Power - surf',
				thumb: 'https://url_to_thumbnail.png',
				duration: '15:30',
				stats: {
					likes_percentage: 84,
					views: 15524,

				},
			},
			{
				id: 1,
				title: 'Longboard Northen California',
				thumb: 'https://url_to_thumbnail.png',
				duration: '3:22',
				price: 2.22,
				stats: {
					likes_percentage: 84,
					views: 15524,

				},
			},
		]
	}	
})