import { Videos } from '../../../../imports/api/videos.js'
import './search.html'

Template.search.onCreated(function () {
  Meteor.subscribe('videos')
  this.keywords = new ReactiveVar()
  this.sorting = new ReactiveVar()
  this.sorting.set('price_asc')
})

Template.search.events({
  'keyup #search' (event) {
    const keywords = event.target.value

    Template.instance().keywords.set(keywords)
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
        return videos
      }
    }
  }

})
