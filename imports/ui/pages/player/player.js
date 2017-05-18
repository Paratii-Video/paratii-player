/* eslint no-console: "off" */
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { sprintf } from 'meteor/sgi:sprintfjs';

import { Videos } from '/imports/api/videos.js'

import './player.html';

let fullscreenOn = false;
let controlsHandler;

// Template.player.onCreated(function bodyOnCreated() {
//   Meteor.subscribe('videos');
// });


Template.player.onCreated(function () {
  const bodyView = Blaze.getView('Template.App_body');
  // this makes the test works
  this.navState = bodyView ? bodyView.templateInstance().navState : new ReactiveVar('minimized');
  this.playPause = new ReactiveVar('play');
});

Template.player.onDestroyed(function () {
  Meteor.clearTimeout(controlsHandler);
});

Template.player.helpers({
  playPause() {
    return Template.instance().playPause.get();
  },
  playPauseIcon() {
    const state = Template.instance().playPause.get();
    return (state === 'play') ? 'img/play-icon.svg' : 'img/pause-icon.svg';
  },

  video() {
    const video_id = FlowRouter.getParam('_id')
    const video = Videos.findOne({'_id': video_id});
    return video;
  },
  formatNumber(number) {
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
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
    navState.set('minimized');
  },
  'click #play-pause-button'(event, instance) {
    const playPause = instance.playPause;
    const navState = instance.navState;
    const video = instance.find('#video-player');
    const controls = instance.find('.player-controls');
    if (playPause.get() === 'play') {
      playPause.set('pause');
      navState.set('closed');
      video.play();
      controlsHandler = Meteor.setTimeout(() => {
        controls.style.display = 'none';
      }, 3000);
    } else {
      playPause.set('play');
      navState.set('minimized');
      video.pause();
      Meteor.clearTimeout(controlsHandler);
    }
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
    const video = instance.find('#video-player');
    const currentTime = video.currentTime;

    // update progress bar
    const progressBar = instance.find('#progress-bar');
    const percentage = Math.floor((100 / video.duration) * currentTime);
    progressBar.value = percentage;

    // update current time
    const minutes = currentTime / 60;
    const seconds = currentTime % 60;
    const currentSpan = instance.find('#current-time');
    currentSpan.textContent = sprintf('%02d:%02d', minutes, seconds);
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
  'loadedmetadata'(event, instance) {
    const video = instance.find('#video-player');
    const duration = Math.floor(video.duration);
    const minutes = duration / 60;
    const seconds = duration % 60;
    const totalSpan = instance.find('#total-time');
    totalSpan.textContent = sprintf('%02d:%02d', minutes, seconds);
    const currentSpan = instance.find('#current-time');
    currentSpan.textContent = sprintf('%02d:%02d', 0, 0);
  },
  'mousemove'(event, instance) {
    const controls = instance.find('.player-controls');
    controls.style.display = 'block';
    Meteor.clearTimeout(controlsHandler);
    controlsHandler = Meteor.setTimeout(() => {
      controls.style.display = 'none';
    }, 3000);
  },
});
