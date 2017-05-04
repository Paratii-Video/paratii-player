import { Template } from 'meteor/templating';

import './playlists.html';

Template.playlists.helpers({
	videos() {
		return [
			{
				id: 1,
				title: 'Nature Power - Surf',
				thumb: '/img/thumb1-img.png',
				duration: '15:30',
				stats: {
					likes_percentage: 84,
					views: 15524,
				},

			
		
			},
{
				id: 1,
				title: 'Nature Power - Surf',
				thumb: '/img/thumb2-img.png',
				duration: '15:30',
				stats: {
					likes_percentage: 84,
					views: 15524,
				},

			
		
			},
		
		]
	}	
})