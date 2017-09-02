import { Template } from 'meteor/templating';
import { formatNumber } from '/imports/lib/utils.js';
import { Videos } from '../../../../imports/api/videos.js';
import { Playlists } from '../../../../imports/api/playlists.js';
import { getUserPTIAddress } from '/imports/api/users.js';
import './playlists.html';

const userAddress = getUserPTIAddress();

Template.playlists.onCreated(function () {
  Meteor.subscribe('videosPlaylist', FlowRouter.getParam('_id'));
  Meteor.subscribe('playlists');
});

function getCurrentPlaylistId(){
  let playlistID = FlowRouter.getParam('_id');
  if( playlistID === undefined && Playlists.find().fetch().length > 0){
    playlistID = Playlists.find().fetch()[0]._id;
  }
  return playlistID;
}

Template.playlists.helpers({
  playlists() {
    const playlists = Playlists.find();
    return playlists;
  },
  videos() {
    if(Playlists.find().fetch().length > 0){
      const playlist = Playlists.findOne({_id: getCurrentPlaylistId() });
      const videosIds = playlist.videos;
      const videos = Videos.find({ _id: { "$in": videosIds } });
      return videos;
    }
  },
  hasPrice(video) {
    return video && video.price && video.price > 0;
  },
  formatNumber(number) {
    return formatNumber(number);
  },
  currentPlaylistName() {
    if(Playlists.find().fetch().length > 0){
      const playlist = Playlists.findOne({_id: getCurrentPlaylistId() });
      return playlist.title;
    }
  },
  currentPlaylistDesc() {
    if(Playlists.find().fetch().length > 0){
      const playlist = Playlists.findOne({_id: getCurrentPlaylistId() });
      return playlist.description;
    }
  }
});


Template.playlists.events({
  'click .playlistSel'(event) {
    Meteor.subscribe('videosPlaylist', FlowRouter.getParam('_id'));
  },
});
