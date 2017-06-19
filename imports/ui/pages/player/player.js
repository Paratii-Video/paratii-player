import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { sprintf } from 'meteor/sgi:sprintfjs';

// const WebcTorrentlient = require('webtorrent');
// const net = require('net-browserify');

import { formatNumber } from '/imports/lib/utils.js';
import { Videos } from '../../../api/videos.js';

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


Template.player.onCreated(function () {
  const bodyView = Blaze.getView('Template.App_body');
  const that = this;

  // this makes the test works
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
  Meteor.subscribe('videos');
  // must brutally do $.getScript because meteors package.json is slightly broken
  // cf. https://github.com/meteor/meteor/issues/7067
  templateDict = this.templateDict
  templateDict.set('status', 'loading webtorrent...');
  $.getScript('https://cdn.jsdelivr.net/webtorrent/latest/webtorrent.min.js', function(){
    var client = new WebTorrent()
    // Sintel, a free, Creative Commons movie
    var magnet_uri = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'


    templateDict.set('status', 'adding magnet_uri')
    client.add(magnet_uri, function (torrent) {
      // Got torrent metadata!
      // console.log('Torrent info hash:', torrent.infoHash)

      // find an .mp4 file in the torrent
      var file = torrent.files.find(function (file) {
        return file.name.endsWith('.mp4')
      })

      // a bit hackishly removing the old element and adding the new one; 
      $('#video-player').remove()
      templateDict.set('status', 'creating video player..')
      file.appendTo('#player-container', { controls: false, autoplay: true }, function(error, element) {
        templateDict.set('status', 'video player created');
        element.setAttribute('id', 'video-player');
      });
      let counter = 0;

      function updateStatus() {
        // templateDict.set('status', 'updating status' + counter);
        counter += 1;
        var numpeers = torrent.numPeers + (client.numPeers === 1 ? ' peer' : ' peers')

        // Progress
        var percent = Math.round(torrent.progress * 100 * 100) / 100
        // $progressBar.style.width = percent + '%'
        // $downloaded.innerHTML = prettyBytes(client.downloaded)
        // $total.innerHTML = prettyBytes(client.length)

        // Remaining time
        var remaining
        if (torrent.done) {
          remaining = 'Done.'
        } else {
          // remaining = moment.duration(client.timeRemaining / 1000, 'seconds').humanize()
          // remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.'
          remaining = (torrent.timeRemaining / 1000) + ' seconds remaining'
        }
        // $remaining.innerHTML = remaining

        // Speed rates
        // $downloadSpeed.innerHTML = prettyBytes(client.downloadSpeed) + '/s'
        // $uploadSpeed.innerHTML = prettyBytes(client.uploadSpeed) + '/s'
        templateDict.set('status', numpeers + '; ' + percent + ' percent' + ' ' + remaining)
       

      };
      setInterval(updateStatus, 500)
      // next lines do not have desired effect; why??
      // var url = file.getBlobURL()
      // console.log('setting url of player to ' + url);
      // $('#video-player').attr('src', url);

      // while this does not work either:
      // Stream the video into the video tag
      // let video = $('video')
      // file.createReadStream().pipe(video)
    })
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

  }
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
  if (videoPlayer.buffered.length > 0) {
    const barWidth = instance.find('#video-progress').offsetWidth;
    const loaded = videoPlayer.buffered.end(0) / videoPlayer.duration;
    instance.templateDict.set('loadedProgress', loaded * barWidth);
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
    const barWidth = instance.find('#video-progress').offsetWidth;
    dict.set('playedProgress', (time / videoPlayer.duration) * barWidth);
    dict.set('scrubberTranslate', barWidth * (time / videoPlayer.duration));

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
  'mousedown #video-progress'(event, instance) {
    $(document).mousemove((e) => {
      const videoPlayer = instance.find('#video-player');
      const progress = instance.find('#video-progress');
      const barWidth = progress.offsetWidth;
      const offset = e.clientX - progress.getBoundingClientRect().left;
      videoPlayer.currentTime = (offset / barWidth) * videoPlayer.duration;
    });
  },
  'click #video-progress'(event, instance) {
    const videoPlayer = instance.find('#video-player');
    const barWidth = instance.find('#video-progress').offsetWidth;
    const offset = event.clientX - event.currentTarget.getBoundingClientRect().left;
    videoPlayer.currentTime = (offset / barWidth) * videoPlayer.duration;
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
