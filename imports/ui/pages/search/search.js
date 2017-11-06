import { Videos } from '../../../../imports/api/videos.js'
import { getUserPTIAddress } from '/imports/api/users.js'

import './search.html'

Template.search.onCreated(function () {
  // Meteor.subscribe('searchedVideos', '')
  this.keywords = new ReactiveVar()
  this.sorting = new ReactiveVar()
  this.sorting.set('price_asc')
  this.results = new ReactiveVar()
  this.lockeds = new ReactiveDict()
  this.autorun(() => {
    // subscribe to videos of the current playlist
    // for each video of the playlist checks if the user bought it
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

    Template.instance().keywords.set(keywords)
    Session.set('lastsearch', keywords)
  },
  'change #sorting' (event) {
    const sorting = event.target.value
    Template.instance().sorting.set(sorting)
  }

})

Template.search.helpers({
  videos () {
    const keyword = Template.instance().keywords.get()
    if (keyword !== undefined) {
      if (keyword.length > 2) {
        Meteor.subscribe('searchedVideos', keyword)
        const videos = Videos.find({}, { sort: [['score', 'desc']] })
        console.log(videos)
        Template.instance().results.set(videos)
        return videos
      }
    }
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
    if (Template.instance().keywords.get().length > 2) {
      return 'No results for: ' + Template.instance().keywords.get()
    } else {
      return 'Please enter almost 3 characters'
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
  }

})
