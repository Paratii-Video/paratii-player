import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { sprintf } from 'meteor/sgi:sprintfjs';

import { formatNumber } from '/imports/lib/utils.js';
import { Videos } from '../../../api/videos.js';
import { createWebtorrentPlayer } from './webtorrent.js';

import './player.html';

let fullscreenOn = false;
let controlsHandler;
let volumeHandler;
let previousVolume = 100;
let _video;

const video = () => {
  const videoId = FlowRouter.getParam('_id');
  if (!_video || _video.id !== videoId) {
    _video = Videos.findOne({ _id: videoId });
  }
  return _video;
};

function renderVideoElement(instance) {
  // adds the source to the vidoe element on this page
  const currentVideo = video();

  if (currentVideo.src.startsWith('magnet:')) {
    createWebtorrentPlayer(instance, currentVideo);
    instance.templateDict.set('torrent', true);
  } else {
    const videoElement = $('#video-player');
    const sourceElement = document.createElement('source');
    sourceElement.src = currentVideo.src;
    sourceElement.type = currentVideo.mimetype;
    videoElement.append(sourceElement);
  }
}

Template.player.onCreated(function () {
  const instance = Template.instance();
  const bodyView = Blaze.getView('Template.App_body');

  // this makes the tests work
  this.navState = bodyView ? bodyView.templateInstance().navState : new ReactiveVar('minimized');

  this.templateDict = new ReactiveDict();
  this.templateDict.set('playing', false);
  this.templateDict.set('currentTime', 0);
  this.templateDict.set('totalTime', 0);
  this.templateDict.set('hideControls', false);
  this.templateDict.set('showVolume', false);
  this.templateDict.set('loadedProgress', 0.0);
  this.templateDict.set('playedProgress', 0.0);
  this.templateDict.set('scrubberTranslate', 0);
  this.templateDict.set('torrent', false);
  this.templateDict.set('volumeValue', 100);
  this.templateDict.set('volScrubberTranslate', 100);

  // TODO: do not subscribe to all vidoes, just to the one we need
  Meteor.subscribe('videos', function () {
    // video subscription is ready
    renderVideoElement(instance);
  });
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
  playedProgress() {
    return Template.instance().templateDict.get('playedProgress');
  },
  loadedProgress() {
    return Template.instance().templateDict.get('loadedProgress');
  },
  scrubberTranslate() {
    return Template.instance().templateDict.get('scrubberTranslate');
  },
  status() {
    return Template.instance().templateDict.get('status');
  },
  volumeValue() {
    return Template.instance().templateDict.get('volumeValue');
  },
  volScrubberTranslate() {
    return Template.instance().templateDict.get('volScrubberTranslate');
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

const setLoadedProgress = (instance) => {
  const videoPlayer = instance.find('#video-player');
  const torrent = instance.templateDict.get('torrent');
  if (videoPlayer.buffered.length > 0 && !torrent) {
    const played = instance.templateDict.get('playedProgress');
    let loaded = 0.0;
    // get the nearst end
    for (i = 0; i < videoPlayer.buffered.length; i += 1) {
      if (loaded <= played) {
        loaded = videoPlayer.buffered.end(i) / videoPlayer.duration;
      }
    }
    instance.templateDict.set('loadedProgress', loaded * 100);
  }
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
    const dict = instance.templateDict;

    // update progress bar
    dict.set('playedProgress', (time / videoPlayer.duration) * 100);
    dict.set('scrubberTranslate', 100 * (time / videoPlayer.duration));

    // update current time
    dict.set('currentTime', time);
    setLoadedProgress(instance);
  },
  'progress #video-player'(event, instance) {
    setLoadedProgress(instance);
  },
  'mouseup'() {
    $(document).off('mousemove');
  },
  'mousedown #scrubber'(event, instance) {
    $(document).mousemove((e) => {
      const videoPlayer = instance.find('#video-player');
      const progress = instance.find('#video-progress');
      const barWidth = progress.offsetWidth;
      const offset = e.clientX - progress.getBoundingClientRect().left;
      videoPlayer.currentTime = (offset / barWidth) * videoPlayer.duration;
      instance.templateDict.set('playedProgress', (offset / barWidth) * 100);
      instance.templateDict.set('scrubberTranslate', (offset / barWidth) * 100);
    });
  },
  'click #video-progress'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const barWidth = instance.find('#video-progress').offsetWidth;
    const offset = event.clientX - event.currentTarget.getBoundingClientRect().left;
    videoPlayer.currentTime = (offset / barWidth) * videoPlayer.duration;
    instance.templateDict.set('playedProgress', (offset / barWidth) * 100);
    instance.templateDict.set('scrubberTranslate', (offset / barWidth) * 100);
  },
  'click #vol-control'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const barWidth = instance.find('#vol-control').offsetWidth;
    const offset = event.clientX - event.currentTarget.getBoundingClientRect().left;
    videoPlayer.volume = offset / barWidth;
    const percent = (offset / barWidth) * 100;
    instance.templateDict.set('volumeValue', percent);
    instance.templateDict.set('volScrubberTranslate', percent);
  },
  'mousedown #vol-scrubber'(event, instance) {
    $(document).mousemove((e) => {
      const videoPlayer = instance.find('#video-player');
      const volume = instance.find('#vol-control');
      const barWidth = volume.offsetWidth;
      const offset = e.clientX - volume.getBoundingClientRect().left;
      videoPlayer.volume = offset / barWidth;
      const percent = (offset / barWidth) * 100;
      instance.templateDict.set('volumeValue', percent);
      instance.templateDict.set('volScrubberTranslate', percent);
    });
  },
  'loadedmetadata'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const duration = Math.floor(videoPlayer.duration);
    instance.templateDict.set('totalTime', duration);
    instance.templateDict.set('currentTime', 0);
    setLoadedProgress(instance);
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
  'click #button-like'() {
    const videoId = FlowRouter.getParam('_id');
    // const videoId = this._id // works as well
    Meteor.call('videos.like', videoId);
  },
  'click #button-dislike'() {
    const videoId = FlowRouter.getParam('_id');
    Meteor.call('videos.dislike', videoId);
  },
});
