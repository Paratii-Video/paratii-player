import { Template } from 'meteor/templating'
import { showModal, _, showLoader, hideLoader } from '/imports/lib/utils.js'
import { Playlists } from '../../../../imports/api/playlists.js'
import '/imports/ui/components/internals/internalsHeader.js'
import '/imports/ui/components/internals/internalsPagination.js'
import '/imports/ui/components/modals/playlist.js'
import '/imports/ui/components/buttons/settingsButton.js'
import './playlists.html'

Template.playlists.onCreated(function () {
  showLoader(_('loader-playlist'))
  Meteor.subscribe('playlists', () => {
    hideLoader()
  })
})

Template.playlists.helpers({
  playlists () {
    const playlists = Playlists.find()
    return playlists
  },
  playlistCounter (playlist) {
    return playlist.videos.length
  },
  getThumbTitle (title) {
    return title.substring(0, 25)
  },
  getThumbUrl (thumbSrc) {
    if (thumbSrc.startsWith('/ipfs/')) {
      return String('https://gateway.paratii.video' + thumbSrc)
    } else {
      return String(thumbSrc)
    }
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
