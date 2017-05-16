/* eslint no-console: "off" */
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import './player.html';

let fullscreenOn = false;

Template.player.onCreated(function () {
  const bodyView = Blaze.getView('Template.App_body');
  // this makes the test works
  this.navState = bodyView ? bodyView.templateInstance().navState : new ReactiveVar('minimized');
  this.playPause = new ReactiveVar('img/play-icon.svg');
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
    console.log('Unsuported fullscreen.');
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
    console.log('Unsuported fullscreen.');
  }
};

Template.player.events({
  'ended #video-player'(event, instance) {
    instance.playPause.set('img/play-icon.svg');
  },
  'click #play-pause-button'(event, instance) {
    const playPause = instance.playPause;
    const navState = instance.navState;
    const video = instance.find('#video-player');
    if (playPause.get() === 'img/play-icon.svg') {
      playPause.set('img/pause-icon.svg');
      video.play();
    } else {
      playPause.set('img/play-icon.svg');
      video.pause();
    }
    navState.set('minimized');
  },
  'click #fullscreen-button'(event, instance) {
    const video = instance.find('#player-container');
    if (fullscreenOn) {
      requestCancelFullscreen(document);
      fullscreenOn = false;
    } else {
      requestFullscreen(video);
      fullscreenOn = true;
    }
  },
  'timeupdate'(event, instance) {
    const progressBar = instance.find('#progress-bar');
    const video = instance.find('#video-player');
    const percentage = Math.floor((100/video.duration)*video.currentTime);
    progressBar.value=percentage;    
  },
  'click #progress-bar'(event, instance){
    const video = instance.find('#video-player');
    const progressBar = instance.find('#progress-bar');
    const time = event.offsetX/progressBar.offsetWidth * video.duration;
    video.currentTime = time;
  }
});
