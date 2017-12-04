import playerjs from 'player.js'
// import { Accounts } from 'meteor/accounts-base'
import { sprintf } from 'meteor/sgi:sprintfjs'
import { web3 } from '/imports/lib/ethereum/connection.js'
import {
  formatNumber,
  showModal,
  showGlobalAlert,
  log,
  toggleFullscreen
} from '/imports/lib/utils.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { Playlists } from '../../../../imports/api/playlists.js'
import { RelatedVideos, CurrentVideos } from '../../../api/videos.js'
import { createWebtorrentPlayer } from './webtorrent.js'
import HLSPlayer from './ipfs_hls.js'
import { createIPFSPlayer } from './ipfs.js'
import '/imports/ui/components/modals/embedCustomizer.js'
import '/imports/ui/components/modals/unlockVideo.js'
import '/imports/ui/components/buttons/fullScreenButton.js'
// import '/imports/ui/components/modals/regenerateKeystore.js'
import './player.html'

let controlsHandler
let volumeHandler
let previousVolume = 100

function renderVideoElement (instance) {
  // adds the source to the vidoe element on this page
  const currentVideo = instance.currentVideo.get()

  document.getElementById('video-player').remove()
  const playerContainer = document.getElementById('player-container')
  const videoTag = document.createElement('video')
  videoTag.className = 'player-video'
  videoTag.id = 'video-player'
  playerContainer.insertBefore(videoTag, playerContainer.firstChild)
  // get video tag element and bind it to player js adapter for HTML5 video

  log('this is the video', videoTag)
  log('this is playerjs', playerjs)

  if (currentVideo.src.startsWith('magnet:')) {
    createWebtorrentPlayer(instance, currentVideo)
    instance.playerState.set('torrent', true)
  } else if (currentVideo.src.startsWith('/ipfs/Qmb3eFpLCNGg1NrPcY5RcHhznibVGuPT28fzZQ7egTzv37')) {
    createIPFSPlayer(instance, currentVideo)
    instance.playerState.set('ipfs', true)
  } else if (currentVideo.src.startsWith('/ipfs')) {
    let hlsPlayer = new HLSPlayer({video: currentVideo})
    instance.playerState.set('ipfs', true)
    hlsPlayer.on('status', (text) => {
      instance.playerState.set('status', text)
    })
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

  // TODO: this is the real referrer passed by embedly
  const referrer = FlowRouter.getQueryParam('referrer')
  const isEmbedly = (referrer !== undefined)
  console.log('embedly: ' + (referrer !== undefined))

  this.currentVideo = new ReactiveVar()
  this.playerContainer = new ReactiveVar()

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
  this.playerState.set('locked', false)
  /* EMBED CONTROLS */
  this.playerState.set('autoplay', autoplay === 1)
  this.playerState.set('loop', loop === 1)
  this.playerState.set('playsinline', playsinline === 1)
  this.playerState.set('type', type === 1)
  this.playerState.set('embedly', isEmbedly)
  // Description
  this.playerState.set('showDescription', false)

  this.togglePlay = () => {
    const dict = this.playerState
    if (dict.get('playing')) {
      pauseVideo(instance)
    } else {
      playVideo(instance)
    }
  }

  log('navState:', this.navState.get())

  /* DETERMINED IF PLAYER IS EMBEDED */
  if (window.top !== window.self) {
    log('embedded')
    this.playerState.set('fullscreen', fullscreen === 1)
  } else {
    log('not embedded')
    this.playerState.set('fullscreen', true)
  }

  if (userPTIAddress) {
    Meteor.subscribe('userTransactions', userPTIAddress)
  }
  const videoId = FlowRouter.getParam('_id')
  Meteor.subscribe('videos', function () {
    self.currentVideo.set(CurrentVideos.findOne({ _id: videoId }))
    renderVideoElement(instance)
  })

  Meteor.subscribe('playlists')
  Meteor.subscribe('relatedVideos', videoId, userPTIAddress)

  Meteor.call('videos.isLocked', FlowRouter.getParam('_id'), getUserPTIAddress(), function (err, results) {
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

Template.player.onRendered(function () {
  const container = this.find('#player-container')
  if (container) {
    container.focus()
    this.playerContainer.set(container)
  }
})

Template.player.helpers({
  videoPlayer () {
    return Template.instance().playerContainer.get()
  },
  currentVideo () {
    const videoId = FlowRouter.getParam('_id')

    Template.instance().currentVideo.set(CurrentVideos.findOne({ _id: videoId }))
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
    return Template.instance().playerState.get('hideControls') ? 'hide-controls' : ''
  },
  formatNumber (number) {
    let numberFormated = formatNumber(number)
    if (numberFormated === false) numberFormated = 0
    return numberFormated
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
    return Template.instance().playerState.get('showVolume') ? '' : 'hide-volume'
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
  },
  getThumbTitle (title) {
    let videoTitle = title
    if (videoTitle.length > 30) {
      videoTitle = videoTitle.substring(0, 30)
    }
    return videoTitle
  }
})

const pauseVideo = (instance) => {
  const video = document.getElementById('video-player')
  video.pause()
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
  const video = document.getElementById('video-player')
  video.play()
}

// Set a value (0 ~ 1) to the player volume and volume UX
const setVolume = (instance, value) => {
  const videoPlayer = document.getElementById('video-player')
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
  const videoPlayer = document.getElementById('video-player')
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
    const button = event.currentTarget
    const price = web3.toWei(button.dataset.price)
    const balance = Session.get('pti_balance')
    const ethBalance = Session.get('eth_balance')
    if (Meteor.user()) {
      console.log('-0-------------------------')
      console.log(`price: ${price}`)
      console.log(`balance: ${balance}`)
      console.log(`eth_balance: ${ethBalance}`)
      console.log('-0-------------------------')
      if (ethBalance === undefined || ethBalance === 0) {
        // check that the user has enough ether for a minimal transaction
        showGlobalAlert(`You need some <strong>Ether</strong> for sending a transaction - but you have none`, 'error')
      } else if (balance === undefined || balance === 0 || parseFloat(price) > parseFloat(balance)) {
        // The user balance is lower than the video price
        showGlobalAlert(`You don't have enough <strong>PTI</strong>: your balance is <strong>${web3.fromWei(balance)}</strong>`, 'error')
      } else {
        showModal('unlockVideo',
          {
            type: 'PTI',
            label: 'Unlock this video',
            action: 'unlock_video',
            price: button.dataset.price, // Video Price
            address: button.dataset.address, // Creator PTI address
            videotitle: button.dataset.title, // Video title
            videoid: Template.instance().currentVideo.get()._id // Video title
          }
        )
      }
    } else {
      showModal('login')
    }
  },
  'play #video-player' (event, instance) {
    log('video is playing')
    const dict = instance.playerState
    const navState = instance.navState
    const videoPlayer = document.getElementById('video-player')
    dict.set('playing', true)
    navState.set('closed')
    $('#app-container').addClass('playing')
    $('#app-container').removeClass('related')
    $('div.main-app').addClass('hide-nav')
    controlsHandler = Meteor.setTimeout(() => {
      if (!videoPlayer.paused) {
        dict.set('hideControls', true)
      }
    }, 3000)
  },
  'loadedmetadata #video-player' (event, instance) {
    const videoPlayer = document.getElementById('video-player')
    const adapter = playerjs.HTML5Adapter(videoPlayer)

    log('this is the adapter', adapter)
    // Start accepting events
    adapter.ready()
  },
  'pause #video-player' (event, instance) {
    log('video is paused')
    instance.playerState.set('playing', false)
    instance.navState.set('minimized')
    Meteor.clearTimeout(controlsHandler)
    instance.playerState.set('hideControls', false)
    $('#app-container').removeClass('playing')
    $('#app-container').removeClass('related')
    $('div.main-app').removeClass('hide-nav')
  },
  'ended #video-player' (event, instance) {
    const navState = instance.navState
    instance.playerState.set('playing', false)
    endedVideo(instance)
    navState.set('minimized')
  },
  'click #play-pause-button' (event, instance) {
    instance.togglePlay(instance)
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
    const videoPlayer = document.getElementById('video-player')
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
    const videoPlayer = document.getElementById('video-player')
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
    const videoPlayer = document.getElementById('video-player')
    dict.set('hideControls', false)
    Meteor.clearTimeout(controlsHandler)
    controlsHandler = Meteor.setTimeout(() => {
      if (!videoPlayer.paused) {
        dict.set('hideControls', true)
      }
    }, 3000)
  },
  'click #video-player' (event, instance) {
    instance.togglePlay()
  },
  'dblclick #video-player' (event, instance) {
    toggleFullscreen(instance.playerContainer.get())
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
    const videoPlayer = document.getElementById('video-player')
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

    const button = event.currentTarget
    const title = button.dataset.title
    const description = button.dataset.description
    const thumb = button.dataset.thumb
    showModal('modal_share_video',
      {
        type: 'modal_share_links',
        videoId: videoId,
        videoTitle: title,
        videoDescription: description,
        videoThumb: thumb,
        embed: window.top !== window.self,
        autoplay: !Template.instance().playerState.get('locked')
      }
    )
  },
  'click .player-infos-button-description' (event, instance) {
    instance.playerState.set('showDescription', !instance.playerState.get('showDescription'))
  },
  'click button.thumbs-list-settings' (event, instance) {
    $(event.currentTarget).parent().toggleClass('active')
  },
  'keydown #player-container' (event, instance) {
    // Space key
    if (event.keyCode === 32) {
      event.preventDefault()
      instance.togglePlay(instance)
    }
  }
})
