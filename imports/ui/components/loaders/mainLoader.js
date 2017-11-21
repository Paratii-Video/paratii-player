import './mainLoader.html'

Template.mainLoader.helpers({
  mainLoaderText () {
    return Session.get('mainLoaderText')
  }
})