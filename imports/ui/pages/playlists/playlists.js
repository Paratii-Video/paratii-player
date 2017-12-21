import { Template } from 'meteor/templating'
import { showModal, _, showLoader, hideLoader } from '/imports/lib/utils.js'
import { Playlists } from '../../../../imports/api/playlists.js'
import '/imports/ui/components/internals/internalsHeader.js'
import '/imports/ui/components/modals/playlist.js'
import './playlists.html'

Template.playlists.onCreated(function () {
  showLoader(_('loader-playlist'))
  Meteor.subscribe('playlists', () => {
    hideLoader()
  })
})

Template.playlists.helpers({
  playlists () {
    return Playlists.find()
  },
  playlistCounter (playlist) {
    return playlist.videos.length
  },
  getThumbTitle (title) {
    return title.substring(0, 25)
  },
  getThumbUrl (thumbSrc) {
    return thumbSrc.startsWith('/ipfs/')
      ? String('https://gateway.paratii.video' + thumbSrc)
      : String(thumbSrc)
  }
})

Template.playlists.events({
  'click #button-create-playlist' () {
    showModal('modal_playlist', {
      type: 'create'
    })
  },
  'mouseleave li.thumbs-list-item' (event, instance) {
    $(event.currentTarget).removeClass('active')
  }
})
