import { Template } from 'meteor/templating'
import { formatNumber, _, showLoader, hideLoader } from '/imports/lib/utils.js'
import { Videos } from '../../../../imports/api/videos.js'
import { Playlists } from '../../../../imports/api/playlists.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import '/imports/ui/components/internals/internalsHeader.js'
import '/imports/ui/components/internals/internalsPagination.js'
import './playlist_videos.html'

Template.playlist_videos.onCreated(function () {
  showLoader(_('loader-playlist'))

  // current playlist
  this.playlist = new ReactiveVar()

  // lockeds videos ids
  this.lockeds = new ReactiveDict()

  // paging init
  this.page = new ReactiveVar()
  this.totalVideos = new ReactiveVar()

  Meteor.subscribe('playlists', () => {
    this.playlist.set(Playlists.findOne({ _id: getCurrentPlaylistId() }))
  })

  // autorun this when the playlist changes
  this.autorun(() => {
    this.page.set(getCurrentPage())

    // subscribe to videos of the current playlist
    Meteor.subscribe(
      'videosPlaylist',
      getCurrentPlaylistId(),
      this.page.get(),
      () => {
        const videosId = this.playlist.get().videos
        this.totalVideos.set(videosId.length)
        verifyLockedVideos(this, videosId)
        hideLoader()
      }
    )
  })
})

function getCurrentPlaylistId () {
  return FlowRouter.getParam('_id')
}

function getCurrentPage () {
  return FlowRouter.getQueryParam('p')
    ? parseInt(FlowRouter.getQueryParam('p'))
    : 0
}

// for each video of the playlist checks if the user bought it
function verifyLockedVideos (instance, videosId) {
  videosId.forEach(id => {
    Meteor.call('videos.isLocked', id, getUserPTIAddress(), (err, result) => {
      if (err) {
        throw err
      }
      instance.lockeds.set(id, result)
    })
  })
}

Template.playlist_videos.helpers({
  videos () {
    // return a list of videos of current playlist
    const playlist = Template.instance().playlist.get()
    if (playlist) {
      return Videos.find({ _id: { $in: playlist.videos } })
    }
    return []
  },
  isLocked (video) {
    return Template.instance().lockeds.get(video._id)
  },
  hasPrice (video) {
    return video && video.price && video.price > 0
  },
  formatNumber (number) {
    return formatNumber(number)
  },
  videoPath (video) {
    const pathDef = 'player'
    const params = { _id: video._id }
    const queryParams = { playlist: getCurrentPlaylistId() }
    return FlowRouter.path(pathDef, params, queryParams)
  },
  getTitle () {
    const playlist = Template.instance().playlist.get()
    if (playlist) {
      return playlist.title
    }
    return ''
  },
  getPrevPage () {
    return '/playlists'
  },
  getThumbTitle (title) {
    return title.substring(0, 25)
  },
  hasNext () {
    const currentPage = Template.instance().page.get()
    const totalItem = Template.instance().totalVideos.get()
    const step = Meteor.settings.public.paginationStep
    if (currentPage * step >= totalItem - step) {
      return false
    } else {
      return true
    }
  },
  hasPrev () {
    const currentPage = Template.instance().page.get()
    const step = Meteor.settings.public.paginationStep
    if (currentPage * step === 0) {
      return false
    } else {
      return true
    }
  },
  getprevpage () {
    const pathDef = 'playlist_videos'
    const params = { _id: getCurrentPlaylistId() }
    const queryParams = { p: Template.instance().page.get() - 1 }
    return FlowRouter.path(pathDef, params, queryParams)
  },
  getnextpage () {
    const pathDef = 'playlist_videos'
    const params = { _id: getCurrentPlaylistId() }
    const queryParams = { p: Template.instance().page.get() + 1 }
    return FlowRouter.path(pathDef, params, queryParams)
  },
  getThumbUrl (thumbSrc) {
    return thumbSrc.startsWith('/ipfs/')
      ? String('https://gateway.paratii.video' + thumbSrc)
      : String(thumbSrc)
  }
})

Template.playlist_videos.events({
  'click button.thumbs-list-settings' (event, instance) {
    $(event.currentTarget).closest('.thumbs-list-item').toggleClass('active')
  },
  'mouseleave li.thumbs-list-item' (event, instance) {
    $(event.currentTarget).removeClass('active')
  }
})
