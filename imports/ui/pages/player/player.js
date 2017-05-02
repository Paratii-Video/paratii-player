import { Template } from 'meteor/templating';
import './player.html';

Template.player.onCreated(function(){
  this.navState = Blaze.getView("Template.App_body").templateInstance().navState
  this.playPause = ReactiveVar("play");
});

Template.player.helpers({
  playPause() {
    return Template.instance().playPause.get();
  },
});

Template.player.events({
  'ended #video-player'(event, instance) {
    instance.playPause.set("play");
  },
  'click #play-pause-button'(event, instance) {
    const playPause = instance.playPause;
    const navState = instance.navState;
    const video = $("#video-player")[0];
    if (playPause.get() === "play") {
      playPause.set("pause");
      video.play();
    } else {
      playPause.set("play");
      video.pause();
    }
    navState.set("minimized");
  },
  'click #fullscreen-button'(event, instance) {
    const video = $("#player-container")[0];
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  }
});
