import { VideosResults } from '../../../../imports/api/videos.js'
import { getUserPTIAddress } from '/imports/api/users.js'
import { _, hideLoader } from '/imports/lib/utils.js'

import '/imports/ui/components/internals/internalsHeader.js'
import './search.html'

Template.search.onCreated(function () {
  // Meteor.subscribe('searchedVideos', '')
  hideLoader()
  this.keywords = new ReactiveVar()
  this.sorting = new ReactiveVar()
  this.sorting.set('price_asc')
  this.results = new ReactiveVar()
  this.lockeds = new ReactiveDict()

  // paging init
  this.hasNext = new ReactiveVar()
  this.page = new ReactiveVar()
  this.totalVideos = new ReactiveVar()

  this.autorun(() => {
    // subscribe to videos of the current playlist
    // for each video of the playlist checks if the user bought it
    let currentPage = (FlowRouter.getQueryParam('p')) ? FlowRouter.getQueryParam('p') : 0
    this.page.set(parseInt(currentPage))

    var self = this
    self.autorun(function () {
      self.subscribe('searchedVideos', Session.get('lastsearch'), self.page.get())
    })

    if (Template.instance().results.get() !== undefined) {
      Template.instance().results.get().forEach((video) => {
        Meteor.call('videos.isLocked', video._id, getUserPTIAddress(), (err, result) => {
          if (err) {
            throw err
          }
          this.lockeds.set(video._id, result)
        })
      })
    }
  })
})

Template.search.events({
  'keyup #search' (event) {
    const keywords = event.target.value
    if (keywords !== undefined) {
      Template.instance().keywords.set(keywords)
    } else {
      Template.instance().keywords.set('')
    }
    Template.instance().page.set(0)
    FlowRouter.setQueryParams({p: 0})
    Session.set('lastsearch', keywords)
  },
  'change #sorting' (event) {
    const sorting = event.target.value
    Template.instance().sorting.set(sorting)
  },
  'click button.thumbs-list-settings' (event, instance) {
    $(event.currentTarget).closest('.thumbs-list-item').toggleClass('active')
  },
  'mouseleave li.thumbs-list-item' (event, instance) {
    $(event.currentTarget).removeClass('active')
  },
  'click .pagenext' () {
    Template.instance().page.set((Template.instance().page.get() + 1))
    FlowRouter.setQueryParams({p: Template.instance().page.get()})
  },
  'click .pageprev' () {
    Template.instance().page.set((Template.instance().page.get() - 1))

    FlowRouter.setQueryParams({p: Template.instance().page.get()})
  }
})

Template.search.helpers({
  videos () {
    const keyword = Template.instance().keywords.get()
    if (keyword !== undefined) {
      if (keyword.length > 2) {
        // Meteor.subscribe('searchedVideos', keyword)
        const videos = VideosResults.find({}, { sort: [['score', 'desc']] })
        // console.log(videos)
        // console.log(videos.fetch())
        if (videos.fetch().length > 0) {
          Template.instance().hasNext.set(true)
          return videos
        } else {
          Template.instance().hasNext.set(false)
          return null
        }
      }
    }
  },
  showPagination () {
    return Template.instance().keywords.get() !== undefined
  },
  lastsearch () {
    const lastSearch = Session.get('lastsearch')
    Template.instance().keywords.set(lastSearch)
    return lastSearch
  },
  isLocked (video) {
    return Template.instance().lockeds.get(video._id)
  },
  noResults () {
    if (Template.instance().keywords.get() !== undefined) {
      if (Template.instance().keywords.get().length > 2) {
        const currentPage = Template.instance().page.get()
        if (currentPage > 0) {
          Template.instance().hasNext.set(false)
          return _('No more results for: ') + '  ' + Template.instance().keywords.get()
        } else {
          return _('No results for: ') + ' ' + Template.instance().keywords.get()
        }
      } else {
        return _('Please enter at least 3 characters')
      }
    }
  },
  videoPath (video) {
    const pathDef = 'player'
    const params = { _id: video._id }
    const path = FlowRouter.path(pathDef, params)
    return path
  },
  hasPrice (video) {
    return video && video.price && video.price > 0
  },
  getThumbTitle (title) {
    let videoTitle = title
    if (videoTitle.length > 30) {
      videoTitle = videoTitle.substring(0, 30)
    }
    return videoTitle
  },
  getThumbUrl (thumbSrc) {
    if (thumbSrc.startsWith('/ipfs/')) {
      return String('https://gateway.paratii.video' + thumbSrc)
    } else {
      return String(thumbSrc)
    }
  },
  hasNext () {
    return Template.instance().hasNext.get()
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
    return '/' + FlowRouter.getRouteName() + '/' + '?p=' + (parseInt(Template.instance().page.get()))
  },
  getnextpage () {
    return '/' + FlowRouter.getRouteName() + '/' + '?p=' + (parseInt(Template.instance().page.get()))
  }
})
