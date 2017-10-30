import { Videos } from '../../../../imports/api/videos.js'
import { getUserPTIAddress } from '/imports/api/users.js'

import './search.html'

Template.search.onCreated(function () {
  Meteor.subscribe('videos')
  this.keywords = new ReactiveVar()
  this.sorting = new ReactiveVar()
  this.sorting.set('price_asc')
  this.results = new ReactiveVar()
  this.lockeds = new ReactiveDict()
  this.autorun(() => {
    // subscribe to videos of the current playlist
    console.log(Template.instance().results.get())
    // for each video of the playlist checks if the user bought it
    if (Template.instance().results.get() !== undefined) {
      Template.instance().results.get().forEach((video) => {
        console.log(video._id)
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
    console.log(keywords)
  },
  'change #sorting' (event) {
    const sorting = event.target.value
    Template.instance().sorting.set(sorting)
  }

})

function buildQuery (queryKeywords) {
  const query = {
    $or: [
      { title: queryKeywords },
      { description: queryKeywords },
      { 'uploader.name': queryKeywords },
      { tags: queryKeywords }
    ]
  }

  return query
}

function buildSorting (sorting) {
  let sort = {}
  if (sorting !== undefined) {
    switch (sorting) {
      case 'price_desc':
        sort = {
          sort: {price: -1}
        }
        return sort
      case 'price_asc':
        sort = {
          sort: {price: 1}
        }
        return sort
    }
  }
}

Template.search.helpers({
  videos () {
    const keyword = Template.instance().keywords.get()
    const sorting = Template.instance().sorting.get()
    if (keyword !== undefined) {
      if (keyword.length > 2) {
        const queryKeywords = new RegExp(keyword, 'i')
        console.log(buildQuery(queryKeywords))
        console.log(buildSorting(sorting))
        const videos = Videos.find(buildQuery(queryKeywords), buildSorting(sorting))
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
    // console.log('locked' + video._id, Template.instance().lockeds.get(video._id))
    return Template.instance().lockeds.get(video._id)
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
