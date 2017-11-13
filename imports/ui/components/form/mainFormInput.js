import './mainFormInput.html'

Template.mainFormInput.onCreated(function () {
  Session.set('passwordType', 'password')
})

Template.mainFormInput.onDestroyed(function () {
  Session.set('passwordType', null)
})

Template.mainFormInput.helpers({
  isCheckbox () {
    return Template.instance().data.type === 'checkbox'
  },
  isPassword () {
    return Template.instance().data.type === 'password'
  },
  passwordType () {
    return Session.get('passwordType')
  }
})

Template.mainFormInput.events({
  'click button.password' () {
    let inputType = (Session.get('passwordType') === 'password') ? 'text' : 'password'
    Session.set('passwordType', inputType)
  }
})
