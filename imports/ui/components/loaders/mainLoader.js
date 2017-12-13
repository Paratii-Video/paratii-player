import './mainLoader.html'

function canChangeLoaderPhrase () {
  return Session.get('showMainLoader') && Session.get('showLoaderPhrases')
}

Template.mainLoader.onCreated(() => {
  let phraseInterval = null
  let duration = 4500

  function changeText () {
    if (phraseInterval) Meteor.clearInterval(phraseInterval)
    Session.set('mainLoaderIndex', 0)

    if (canChangeLoaderPhrase()) {
      phraseInterval = Meteor.setInterval(() => {
        if (canChangeLoaderPhrase()) {
          let index = Session.get('mainLoaderIndex') + 1
          if (index === Session.get('mainLoaderText').length) index = 0
          Session.set('mainLoaderIndex', index)
        } else {
          if (phraseInterval) Meteor.clearInterval(phraseInterval)
        }
      }, duration)
    }
  }

  Tracker.autorun(() => {
    let sessionVal = Session.get('showLoaderPhrases')
    changeText(sessionVal)
  })
})

Template.mainLoader.helpers({
  loaderPhrases () {
    return Session.get('mainLoaderText')
  },
  showLoaderPhrases () {
    return canChangeLoaderPhrase()
  },
  showPhrase (index) {
    return index === Session.get('mainLoaderIndex')
  },
  mainLoaderText (index) {
    return (Session.get('showLoaderPhrases') && (index >= 0)) ? Session.get('mainLoaderText')[index] : Session.get('mainLoaderText')
  }
})
