export const Playlists = new Mongo.Collection('playlists')

if (Meteor.isServer) {
  Meteor.publish('playlists', function () {
    return Playlists.find()
  })

  Meteor.methods({
    'playlists.create' (playlist) {
      check(playlist, {
        id: String,
        title: String,
        description: String,
        url: String,
        videos: [String]
      })
      Playlists.insert({
        _id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        url: playlist.url,
        videos: playlist.videos
      })
      return playlist.id
    }
  })
}
