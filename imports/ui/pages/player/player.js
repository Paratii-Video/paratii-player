/* eslint no-console: "off" */
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import './player.html';

let fullscreenOn = false;

Template.player.onCreated(function () {
  const bodyView = Blaze.getView('Template.App_body');
  // this makes the test works
  this.navState = bodyView ? bodyView.templateInstance().navState : new ReactiveVar('minimized');
  this.playPause = new ReactiveVar('play');
});

Template.player.helpers({
  playPause() {
    return Template.instance().playPause.get();
  },
  playPauseIcon() {
    const state = Template.instance().playPause.get();
    return (state === 'play') ? 'img/play-icon.svg' : 'img/pause-icon.svg';
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
    const percentage = Math.floor((100 / video.duration) * video.currentTime);
    progressBar.value = percentage;
  },
  'input #progress-bar'(event, instance) {
    const video = instance.find('#video-player');
    const inputValue = event.target.valueAsNumber;
    const time = (inputValue / 100.0) * video.duration;
    video.currentTime = time;
  },
  'input #vol-control'(event, instance) {
    const video = instance.find('#video-player');
    const inputValue = event.target.valueAsNumber;
    video.volume = inputValue / 100.0;
  },
});
