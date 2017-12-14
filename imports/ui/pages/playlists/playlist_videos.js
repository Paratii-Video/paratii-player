import { Template } from 'meteor/templating'
import {
  formatNumber,
  _,
  showLoader,
  hideLoader
} from '/imports/lib/utils.js'
import { Videos } from '../../../../imports/api/videos.js'
import { Playlists } from '../../../../imports/api/playlists.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import '/imports/ui/components/internals/internalsHeader.js'
import '/imports/ui/components/internals/internalsPagination.js'
import '/imports/ui/components/modals/playlist.js'
import '/imports/ui/components/buttons/settingsButton.js'
import './playlist_videos.html'

Template.playlist_videos.onCreated(function () {
  showLoader(_('loader-playlist'))

  // paging init
  this.page = new ReactiveVar()
  this.totalVideos = new ReactiveVar()

  this.playlist = new ReactiveVar()
  this.lockeds = new ReactiveDict()

  Meteor.subscribe('playlists', () => {
    this.playlist.set(Playlists.findOne({ _id: getCurrentPlaylistId() }))
  })

  // autorun this when the playlist changes
  this.autorun(() => {
    // subscribe to videos of the current playlist
    let currentPage = FlowRouter.getQueryParam('p')
      ? FlowRouter.getQueryParam('p')
      : 0
    this.page.set(parseInt(currentPage))
    console.log('currentpage on autorun', currentPage)

    Meteor.subscribe(
      'videosPlaylist',
      FlowRouter.getParam('_id'),
      this.page.get(),
      () => {
        const videosId = this.playlist.get().videos
        this.totalVideos.set(videosId.length)
        hideLoader()
        // for each video of the playlist checks if the user bought it
        videosId.forEach(id => {
          Meteor.call(
            'videos.isLocked',
            id,
            getUserPTIAddress(),
            (err, result) => {
              if (err) {
                throw err
              }
              this.lockeds.set(id, result)
            }
          )
        })
      }
    )
  })
})

function getCurrentPlaylistId () {
  return FlowRouter.getParam('_id')
}

Template.playlist_videos.helpers({
  videos () {
    const playlist = Template.instance().playlist.get()
    if (playlist) {
      const videosIds = playlist.videos
      const videos = Videos.find({ _id: { $in: videosIds } })
      return videos
    }
    return []
  },
  isLocked (video) {
    // console.log('locked' + video._id, Template.instance().lockeds.get(video._id))
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
    const path = FlowRouter.path(pathDef, params, queryParams)
    return path
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
    let videoTitle = title
    if (videoTitle.length > 25) {
      videoTitle = videoTitle.substring(0, 25)
    }
    return videoTitle
  },
  hasNext () {
    console.log('has next', Template.instance().totalVideos.get())
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
    console.log('has prev', Template.instance().totalVideos.get())
    const currentPage = Template.instance().page.get()
    const step = Meteor.settings.public.paginationStep

    if (currentPage * step === 0) {
      return false
    } else {
      return true
    }
  },
  getprevpage () {
    return (
      '/' +
      FlowRouter.getRouteName() +
      '/' +
      getCurrentPlaylistId() +
      '?p=' +
      parseInt(Template.instance().page.get())
    )
  },
  getnextpage () {
    return (
      '/' +
      FlowRouter.getRouteName() +
      '/' +
      getCurrentPlaylistId() +
      '?p=' +
      parseInt(Template.instance().page.get())
    )
  },
  getThumbUrl (thumbSrc) {
    if (thumbSrc.startsWith('/ipfs/')) {
      return String('https://gateway.paratii.video' + thumbSrc)
    } else {
      return String(thumbSrc)
    }
  }
})

Template.playlist_videos.events({
  'click .pagenext' () {
    Template.instance().page.set(Template.instance().page.get() + 1)
    FlowRouter.setQueryParams({ p: Template.instance().page.get() })
  },
  'click .pageprev' () {
    Template.instance().page.set(Template.instance().page.get() - 1)
    FlowRouter.setQueryParams({ p: Template.instance().page.get() })
  },
  'click button.thumbs-list-settings' (event, instance) {
    $(event.currentTarget).closest('.thumbs-list-item').toggleClass('active')
  },
  'mouseleave li.thumbs-list-item' (event, instance) {
    $(event.currentTarget).removeClass('active')
  }
})
