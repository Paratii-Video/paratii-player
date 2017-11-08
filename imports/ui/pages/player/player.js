import { Template } from 'meteor/templating'
import { Blaze } from 'meteor/blaze'
// import { Accounts } from 'meteor/accounts-base'
import { sprintf } from 'meteor/sgi:sprintfjs'
import { formatNumber, showModal } from '/imports/lib/utils.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { Playlists } from '../../../../imports/api/playlists.js'
import { Videos, RelatedVideos } from '../../../api/videos.js'
import { createWebtorrentPlayer } from './webtorrent.js'
import * as HLSPlayer from './ipfs_hls.js'
import { createIPFSPlayer } from './ipfs.js'
import '/imports/ui/components/modals/sign.js'
import '/imports/ui/components/modals/embedCustomizer.js'
import '/imports/ui/components/modals/unlockVideo.js'
// import '/imports/ui/components/modals/regenerateKeystore.js'

import './player.html'

let controlsHandler
let volumeHandler
let previousVolume = 100
// let _video = new ReactiveVar()

const fullscreen = () => {
  return document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
}

// function getVideo () {
//   const videoId = FlowRouter.getParam('_id')
//   if (!_video || _video.id !== videoId) {
//     _video = Videos.findOne({ _id: videoId })
//   }
//   return _video
// }

function renderVideoElement (instance) {
  // adds the source to the vidoe element on this page
  const currentVideo = instance.currentVideo.get()

  document.getElementById('video-player').remove()
  const playerContainer = document.getElementById('player-container')
  const videoTag = document.createElement('video')
  videoTag.className = 'player-video'
  videoTag.id = 'video-player'
  playerContainer.insertBefore(videoTag, playerContainer.firstChild)

  if (currentVideo.src.startsWith('magnet:')) {
    createWebtorrentPlayer(instance, currentVideo)
    instance.playerState.set('torrent', true)
  } else if (currentVideo.src.startsWith('/ipfs/Qmb3eFpLCNGg1NrPcY5RcHhznibVGuPT28fzZQ7egTzv37')) {
    createIPFSPlayer(instance, currentVideo)
    instance.playerState.set('ipfs', true)
  } else if (currentVideo.src.startsWith('/ipfs')) {
    HLSPlayer.createIPFSPlayer(instance, currentVideo)
    instance.playerState.set('ipfs', true)
  } else {
    const videoElement = $('#video-player')
    const sourceElement = document.createElement('source')
    sourceElement.src = currentVideo.src
    sourceElement.type = currentVideo.mimetype
    videoElement.append(sourceElement)
  }
}

Template.player.onCreated(function () {
  const self = this
  const userPTIAddress = getUserPTIAddress()
  const instance = Template.instance()
  const bodyView = Blaze.getView('Template.App_body')
  // embed/extra parameters
  const autoplay = parseInt(FlowRouter.getQueryParam('autoplay'))
  const loop = parseInt(FlowRouter.getQueryParam('loop'))
  const playsinline = parseInt(FlowRouter.getQueryParam('playsinline'))
  const fullscreen = parseInt(FlowRouter.getQueryParam('fullscreen'))
  const type = parseInt(FlowRouter.getQueryParam('type'))

  this.currentVideo = new ReactiveVar()

  // this makes the tests work
  this.navState = bodyView ? bodyView.templateInstance().navState : new ReactiveVar('minimized')

  this.playerState = new ReactiveDict()
  this.playerState.set('playing', false)
  this.playerState.set('ended', false)
  this.playerState.set('currentTime', 0)
  this.playerState.set('totalTime', 0)
  this.playerState.set('hideControls', false)
  this.playerState.set('showVolume', false)
  this.playerState.set('loadedProgress', 0.0)
  this.playerState.set('playedProgress', 0.0)
  this.playerState.set('scrubberTranslate', 0)
  this.playerState.set('torrent', false)
  this.playerState.set('volumeValue', 100)
  this.playerState.set('volScrubberTranslate', 100)
  this.playerState.set('muted', false)
  this.playerState.set('locked', true)
  /* EMBED CONTROLS */
  this.playerState.set('autoplay', autoplay === 1)
  this.playerState.set('loop', loop === 1)
  this.playerState.set('playsinline', playsinline === 1)
  this.playerState.set('type', type === 1)
  // Description
  this.playerState.set('showDescription', false)

  console.log('navState:', this.navState.get())

  /* DETERMINED IF PLAYER IS EMBEDED */
  if (window.top !== window.self) {
    console.log('embedded')
    this.playerState.set('fullscreen', fullscreen === 1)
  } else {
    console.log('not embedded')
    this.playerState.set('fullscreen', true)
  }

  if (userPTIAddress) {
    Meteor.subscribe('userTransactions', userPTIAddress)
  }
  const videoId = FlowRouter.getParam('_id')
  Meteor.subscribe('videos', function () {
    self.currentVideo.set(Videos.findOne({ _id: videoId }))
    renderVideoElement(instance)
  })

  Meteor.subscribe('playlists')
  Meteor.subscribe('relatedVideos', videoId, userPTIAddress)

  Meteor.call('videos.isLocked', FlowRouter.getParam('_id'), getUserPTIAddress(), function (err, results) {
    console.log('0000')
    console.log(results)
    if (err) {
      throw err
    } else {
      self.playerState.set('locked', results)
      // hide everything if the video is unlocked and autoplay is true
      if (self.playerState.get('autoplay') && !self.playerState.get('locked')) {
        self.playerState.set('playing', true)

        self.playerState.set('hideControls', true)
        self.navState.set('closed')
      }
    }
  })
})

Template.player.onDestroyed(function () {
  Meteor.clearTimeout(controlsHandler)
})

Template.player.helpers({
  currentVideo () {
    const videoId = FlowRouter.getParam('_id')

    Template.instance().currentVideo.set(Videos.findOne({ _id: videoId }))
    renderVideoElement(Template.instance())
  },
  isLocked () {
    return Template.instance().playerState.get('locked')
  },
  playPause () {
    return Template.instance().playerState.get('playing') ? 'pause' : 'play'
  },
  playPauseIcon () {
    const state = Template.instance().playerState.get('playing')
    return (state) ? '/img/pause-icon.svg' : '/img/play-icon.svg'
  },
  currentTime () {
    return Template.instance().playerState.get('currentTime')
  },
  totalTime () {
    return Template.instance().playerState.get('totalTime')
  },
  hideControls () {
    return Template.instance().playerState.get('hideControls') ? 'toggleFade' : ''
  },
  formatNumber (number) {
    return formatNumber(number)
  },
  formatTime (seconds) {
    const minutes = seconds / 60
    const remainingSeconds = seconds % 60
    return sprintf('%02d:%02d', minutes, remainingSeconds)
  },
  loadedProgress () {
    return Template.instance().playerState.get('loadedProgress')
  },
  playedProgress () {
    return Template.instance().playerState.get('playedProgress')
  },
  scrubberTranslate () {
    return Template.instance().playerState.get('scrubberTranslate')
  },
  status () {
    return Template.instance().playerState.get('status')
  },
  video () {
    return Template.instance().currentVideo.get()
  },
  volumeClass () {
    return Template.instance().playerState.get('showVolume') ? '' : 'closed'
  },
  volumeValue () {
    return Template.instance().playerState.get('volumeValue')
  },
  volScrubberTranslate () {
    return Template.instance().playerState.get('volScrubberTranslate')
  },
  mutedClass () {
    const state = Template.instance().playerState.get('muted')
    return (state) ? 'muted' : ''
  },
  hasPlaylistId () {
    return FlowRouter.getQueryParam('playlist') != null
  },
  relatedIsShowable () {
    return FlowRouter.getQueryParam('playlist') == null
  },
  autoplay () {
    if (Template.instance().playerState.get('locked')) return ''
    return Template.instance().playerState.get('autoplay') === true ? 'autoplay' : ''
  },
  loop () {
    return Template.instance().playerState.get('loop') === true ? 'loop' : ''
  },
  playsinline () {
    return Template.instance().playerState.get('playsinline') === true ? 'playsinline' : ''
  },
  fullscreen () {
    return Template.instance().playerState.get('fullscreen')
  },
  type () {
    return Template.instance().playerState.get('type')
  },
  descriptionClass () {
    return Template.instance().playerState.get('showDescription') ? 'show-description' : ''
  },
  relatedVideos () {
    return RelatedVideos.find()
  },
  videoPath (video) {
    const pathDef = 'player'
    const params = { _id: video._id }
    const path = FlowRouter.path(pathDef, params)
    return path
  }
})

const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else {
    // console.log('Unsuported fullscreen.');
  }
}

const requestCancelFullscreen = (element) => {
  if (element.exitFullscreen) {
    element.exitFullscreen()
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen()
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen()
  } else {
    // console.log('Unsuported fullscreen.');
  }
}

const pauseVideo = (instance) => {
  instance.playerState.set('playing', false)
  instance.navState.set('minimized')
  instance.find('#video-player').pause()
  Meteor.clearTimeout(controlsHandler)
  instance.playerState.set('hideControls', false)
  $('#app-container').removeClass('playing')
  $('#app-container').removeClass('related')
  $('div.main-app').removeClass('hide-nav')
}

const endedVideo = (instance) => {
  instance.playerState.set('ended', true)
  if (!FlowRouter.getQueryParam('playlist')) {
    // show related only if there's no playlist
    $('#app-container').addClass('related')
  }
  $('#app-container').removeClass('playing')
}
const playVideo = (instance) => {
  const dict = instance.playerState
  const navState = instance.navState
  const videoPlayer = instance.find('#video-player')
  dict.set('playing', true)
  navState.set('closed')
  videoPlayer.play()
  $('#app-container').addClass('playing')
  $('#app-container').removeClass('related')
  $('div.main-app').addClass('hide-nav')
  controlsHandler = Meteor.setTimeout(() => {
    if (!videoPlayer.paused) {
      dict.set('hideControls', true)
    }
  }, 3000)
}

// Set a value (0 ~ 1) to the player volume and volume UX
const setVolume = (instance, value) => {
  const videoPlayer = instance.find('#video-player')
  videoPlayer.volume = value
  instance.playerState.set('volumeValue', value * 100)
  instance.playerState.set('volScrubberTranslate', value * 100)
  if (value > 0) {
    instance.playerState.set('muted', false)
  } else {
    instance.playerState.set('muted', true)
  }
}

const setLoadedProgress = (instance) => {
  const videoPlayer = instance.find('#video-player')
  const torrent = instance.playerState.get('torrent')
  if (videoPlayer.buffered.length > 0 && !torrent) {
    const played = instance.playerState.get('playedProgress')
    let loaded = 0.0
    // get the nearst end
    for (let i = 0; i < videoPlayer.buffered.length; i += 1) {
      if (loaded <= played) {
        loaded = videoPlayer.buffered.end(i) / videoPlayer.duration
      }
    }
    instance.playerState.set('loadedProgress', loaded * 100)
  }
}

Template.player.events({
  'click #unlock-video' (event) {
    event.stopPropagation()
    if (Meteor.user()) {
      console.log(event.target)
      showModal('unlockVideo',
        {
          type: 'PTI',
          label: 'Unlock this video',
          action: 'unlock_video',
          price: event.target.dataset.price, // Video Price
          address: event.target.dataset.address, // Creator PTI address
          videotitle: event.target.dataset.title, // Video title
          videoid: Template.instance().currentVideo.get()._id // Video title
        }
      )
    } else {
      showModal('login')
    }
  },
  'ended #video-player' (event, instance) {
    const navState = instance.navState
    instance.playerState.set('playing', false)
    endedVideo(instance)
    navState.set('minimized')
  },
  'click #play-pause-button' (event, instance) {
    const dict = instance.playerState
    if (dict.get('playing')) {
      pauseVideo(instance)
    } else {
      playVideo(instance)
    }
  },
  'click #next-video-button' () {
    const playlistId = FlowRouter.getQueryParam('playlist')
    const playlist = Playlists.findOne({ _id: playlistId })
    const videos = playlist.videos
    const currentIndex = videos.indexOf(Template.instance().currentVideo.get()._id)
    var nextId
    if (videos[currentIndex + 1] != null) {
      nextId = videos[currentIndex + 1]
    } else {
      nextId = videos[0]
    }
    const pathDef = 'player'
    const params = { _id: nextId }
    const queryParams = { playlist: playlistId }
    Template.instance().currentVideo.set()
    FlowRouter.go(pathDef, params, queryParams)
  },
  'click #previous-video-button' (event, instance) {
    if (instance.playerState.get('currentTime') > 5) {
      const videoPlayer = instance.find('#video-player')
      videoPlayer.currentTime = 0
    } else {
      const playlistId = FlowRouter.getQueryParam('playlist')
      const playlist = Playlists.findOne({ _id: playlistId })
      const videos = playlist.videos
      const currentIndex = videos.indexOf(Template.instance().currentVideo.get()._id)
      var previousId
      if (videos[currentIndex - 1] != null) {
        previousId = videos[currentIndex - 1]
      } else {
        previousId = videos[videos.length - 1]
      }
      const pathDef = 'player'
      const params = { _id: previousId }
      const queryParams = { playlist: playlistId }
      FlowRouter.go(pathDef, params, queryParams)
    }
  },
  'click #fullscreen-button' (event, instance) {
    const bodyView = Blaze.getView('Template.App_body')
    const videoPlayer = bodyView.templateInstance().find('#player-fullscreen-container')
    if (fullscreen()) {
      requestCancelFullscreen(document)
    } else {
      requestFullscreen(videoPlayer)
    }
  },
  'timeupdate' (event, instance) {
    const videoPlayer = instance.find('#video-player')
    const time = videoPlayer.currentTime
    const dict = instance.playerState

    // update progress bar
    dict.set('playedProgress', (time / videoPlayer.duration) * 100)
    dict.set('scrubberTranslate', 100 * (time / videoPlayer.duration))

    // update current time
    dict.set('currentTime', time)
    setLoadedProgress(instance)
  },
  'progress #video-player' (event, instance) {
    setLoadedProgress(instance)
  },
  'mouseup' () {
    $(document).off('mousemove')
  },
  'mousedown #scrubber' (event, instance) {
    $(document).mousemove((e) => {
      const videoPlayer = instance.find('#video-player')
      const progress = instance.find('#video-progress')
      const barWidth = progress.offsetWidth
      const offset = e.clientX - progress.getBoundingClientRect().left
      videoPlayer.currentTime = (offset / barWidth) * videoPlayer.duration
      instance.playerState.set('playedProgress', (offset / barWidth) * 100)
      instance.playerState.set('scrubberTranslate', (offset / barWidth) * 100)
    })
  },
  'click #video-progress' (event, instance) {
    const videoPlayer = instance.find('#video-player')
    const barWidth = instance.find('#video-progress').offsetWidth
    const offset = event.clientX - event.currentTarget.getBoundingClientRect().left
    videoPlayer.currentTime = (offset / barWidth) * videoPlayer.duration
    instance.playerState.set('playedProgress', (offset / barWidth) * 100)
    instance.playerState.set('scrubberTranslate', (offset / barWidth) * 100)
    $('#app-container').removeClass('related')
  },
  'click #vol-control' (event, instance) {
    const barWidth = instance.find('#vol-control').offsetWidth
    const offset = event.clientX - event.currentTarget.getBoundingClientRect().left
    setVolume(instance, offset / barWidth)
  },
  'mousedown #vol-scrubber' (event, instance) {
    $(document).mousemove((e) => {
      const volume = instance.find('#vol-control')
      const barWidth = volume.offsetWidth
      const offset = e.clientX - volume.getBoundingClientRect().left
      setVolume(instance, offset / barWidth)
    })
  },
  'loadedmetadata' (event, instance) {
    const videoPlayer = instance.find('#video-player')
    const duration = Math.floor(videoPlayer.duration)
    instance.playerState.set('totalTime', duration)
    // reset player state frontend
    instance.playerState.set('currentTime', 0)
    instance.playerState.set('playedProgress', 0.0)
    instance.playerState.set('scrubberTranslate', 0)

    pauseVideo(Template.instance())
    setLoadedProgress(instance)
  },
  'mousemove' (event, instance) {
    const dict = instance.playerState
    const videoPlayer = instance.find('#video-player')
    dict.set('hideControls', false)
    Meteor.clearTimeout(controlsHandler)
    controlsHandler = Meteor.setTimeout(() => {
      if (!videoPlayer.paused) {
        dict.set('hideControls', true)
      }
    }, 3000)
  },
  'click #video-player' (event, instance) {
    pauseVideo(instance)
  },
  'mouseover #volume-button, mouseover #vol-control' (event, instance) {
    Meteor.clearTimeout(volumeHandler)
    instance.playerState.set('showVolume', true)
  },
  'mouseout #volume-button, mouseout #vol-control' (event, instance) {
    volumeHandler = Meteor.setTimeout(() => {
      instance.playerState.set('showVolume', false)
    }, 1000)
  },
  'click #volume-button' (event, instance) {
    const videoPlayer = instance.find('#video-player')
    if (videoPlayer.volume > 0) {
      previousVolume = videoPlayer.volume
      setVolume(instance, 0)
    } else {
      setVolume(instance, previousVolume)
    }
  },
  'click #button-like' () {
    const videoId = Template.instance().currentVideo.get()._id
    const userAddress = getUserPTIAddress()
    // const videoId = this._id // works as well
    Meteor.call('videos.like', userAddress, videoId)
  },
  'click #button-dislike' () {
    const videoId = Template.instance().currentVideo.get()._id
    const userAddress = getUserPTIAddress()
    Meteor.call('videos.dislike', userAddress, videoId)
  },
  'click #embed' (event, instance) {
    const videoId = Template.instance().currentVideo.get()._id
    showModal('modal_share_video',
      {
        type: 'modal_share_links',
        videoId: videoId,
        embed: window.top !== window.self,
        autoplay: !Template.instance().playerState.get('locked')
      }
    )
  },
  'click .player-infos-button-description' (event, instance) {
    instance.playerState.set('showDescription', !instance.playerState.get('showDescription'))
  }
})
