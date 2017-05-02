import { Template } from 'meteor/templating';
import './player.html';

let fullscreenOn = false;

Template.player.onCreated(function () {
  this.navState = Blaze.getView('Template.App_body').templateInstance().navState;
  this.playPause = new ReactiveVar('play');
});

Template.player.helpers({
  playPause() {
    return Template.instance().playPause.get();
  },
});

const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else {
    console.log('Ununsuported fullscreen.');
  }
};

const requestCancelFullscreen = (element) => {
  if (element.exitFullscreen) {
    element.exitFullscreen();
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen();
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen();
  } else {
    console.log('Ununsuported fullscreen.');
  }
};

Template.player.events({
  'ended #video-player'(event, instance) {
    instance.playPause.set('play');
  },
  'click #play-pause-button'(event, instance) {
    const playPause = instance.playPause;
    const navState = instance.navState;
    const video = instance.find('#video-player');
    if (playPause.get() === 'play') {
      playPause.set('pause');
      video.play();
    } else {
      playPause.set('play');
      video.pause();
    }
    navState.set('minimized');
  },
  'click #fullscreen-button'(event, instance) {
    const video = instance.find('#player-container');
    console.log(fullscreenOn);
    if (fullscreenOn) {
      requestCancelFullscreen(document);
      fullscreenOn = false;
    } else {
      requestFullscreen(video);
      fullscreenOn = true;
    }
  },
});
