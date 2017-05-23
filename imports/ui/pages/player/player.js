import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { sprintf } from 'meteor/sgi:sprintfjs';

import { formatNumber } from '/imports/lib/utils.js';
import { Videos } from '../../../api/videos.js';

import './player.html';

let fullscreenOn = false;
let controlsHandler;
let volumeHandler;
let previousVolume = 100;
let _video;

// Template.player.onCreated(function bodyOnCreated() {
//   Meteor.subscribe('videos');
// });

const video = () => {
  const videoId = FlowRouter.getParam('_id');
  if (!_video || _video.id !== videoId) {
    _video = Videos.findOne({ _id: videoId });
  }
  return _video;
};

Template.player.onCreated(function () {
  const bodyView = Blaze.getView('Template.App_body');

  // this makes the test works
  this.navState = bodyView ? bodyView.templateInstance().navState : new ReactiveVar('minimized');

  this.templateDict = new ReactiveDict();
  this.templateDict.set('playing', false);
  this.templateDict.set('currentTime', 0);
  this.templateDict.set('totalTime', 0);
  this.templateDict.set('hideControls', false);
  this.templateDict.set('showVolume', false);
});

Template.player.onDestroyed(function () {
  Meteor.clearTimeout(controlsHandler);
});

Template.player.helpers({
  playPause() {
    return Template.instance().templateDict.get('playing') ? 'pause' : 'play';
  },
  playPauseIcon() {
    const state = Template.instance().templateDict.get('playing');
    return (state) ? '/img/pause-icon.svg' : '/img/play-icon.svg';
  },
  currentTime() {
    return Template.instance().templateDict.get('currentTime');
  },
  totalTime() {
    return Template.instance().templateDict.get('totalTime');
  },
  video() {
    return video();
  },
  hasPrice() {
    return video().price && video().price > 0;
  },
  hideControls() {
    return Template.instance().templateDict.get('hideControls') ? 'toggleFade' : '';
  },
  formatNumber(number) {
    return formatNumber(number);
  },
  formatTime(seconds) {
    const minutes = seconds / 60;
    const remainingSeconds = seconds % 60;
    return sprintf('%02d:%02d', minutes, remainingSeconds);
  },
  volumeClass() {
    return Template.instance().templateDict.get('showVolume') ? '' : 'closed';
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
    // console.log('Unsuported fullscreen.');
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
    // console.log('Unsuported fullscreen.');
  }
};

const pauseVideo = (instance) => {
  instance.templateDict.set('playing', false);
  instance.navState.set('minimized');
  instance.find('#video-player').pause();
  Meteor.clearTimeout(controlsHandler);
  instance.templateDict.set('hideControls', false);
};

Template.player.events({
  'ended #video-player'(event, instance) {
    const navState = instance.navState;
    instance.templateDict.set('playing', false);
    navState.set('minimized');
  },
  'click #play-pause-button'(event, instance) {
    const dict = instance.templateDict;
    const navState = instance.navState;
    const videoPlayer = instance.find('#video-player');
    if (dict.get('playing')) {
      pauseVideo(instance);
    } else {
      dict.set('playing', true);
      navState.set('closed');
      videoPlayer.play();
      controlsHandler = Meteor.setTimeout(() => {
        if (!videoPlayer.paused) {
          dict.set('hideControls', true);
        }
      }, 3000);
    }
  },
  'click #fullscreen-button'(event, instance) {
    const videoPlayer = instance.find('#player-container');
    if (fullscreenOn) {
      requestCancelFullscreen(document);
      fullscreenOn = false;
    } else {
      requestFullscreen(videoPlayer);
      fullscreenOn = true;
    }
  },
  'timeupdate'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const time = videoPlayer.currentTime;

    // update progress bar
    const progressBar = instance.find('#progress-bar');
    const percentage = Math.floor((100 / videoPlayer.duration) * time);
    progressBar.value = percentage;

    // update current time
    instance.templateDict.set('currentTime', time);
  },
  'input #progress-bar'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const inputValue = event.target.valueAsNumber;
    const time = (inputValue / 100.0) * videoPlayer.duration;
    videoPlayer.currentTime = time;
  },
  'input #vol-control'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const inputValue = event.target.valueAsNumber;
    videoPlayer.volume = inputValue / 100.0;
  },
  'loadedmetadata'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const duration = Math.floor(videoPlayer.duration);
    instance.templateDict.set('totalTime', duration);
    instance.templateDict.set('currentTime', 0);
  },
  'mousemove'(event, instance) {
    const dict = instance.templateDict;
    const videoPlayer = instance.find('#video-player');
    dict.set('hideControls', false);
    Meteor.clearTimeout(controlsHandler);
    controlsHandler = Meteor.setTimeout(() => {
      if (!videoPlayer.paused) {
        dict.set('hideControls', true);
      }
    }, 3000);
  },
  'click #video-player'(event, instance) {
    pauseVideo(instance);
  },
  'mouseover #volume-button, mouseover #vol-control'(event, instance) {
    Meteor.clearTimeout(volumeHandler);
    instance.templateDict.set('showVolume', true);
  },
  'mouseout #volume-button, mouseout #vol-control'(event, instance) {
    volumeHandler = Meteor.setTimeout(() => {
      instance.templateDict.set('showVolume', false);
    }, 1000);
  },
  'click #volume-button'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const volumeBar = instance.find('#vol-control');
    if (videoPlayer.volume > 0) {
      previousVolume = videoPlayer.volume;
      videoPlayer.volume = 0;
      volumeBar.value = 0;
    } else {
      videoPlayer.volume = previousVolume;
      volumeBar.value = previousVolume * 100;
    }
  },
});
