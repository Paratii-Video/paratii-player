/* eslint-env browser */

import { Template } from 'meteor/templating'
import './editAvatar.html'

Template.editAvatar.onCreated(function () {
  this.avatarUrl = new ReactiveVar('')
  this.errorMessage = new ReactiveVar('')
})

Template.editAvatar.helpers({
  imageUrl () {
    return Template.instance().avatarUrl.get() || Meteor.user().profile.image || '/img/avatar_img.svg'
  },
  disabled () {
    return (!Template.instance().avatarUrl.get() && 'disabled') || ''
  },
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.editAvatar.events({
  'change input[name="new-avatar"]' (event) {
    const templateInstance = Template.instance()
    event.preventDefault()
    const target = event.target
    const files = target.files
    if (files.length === 0) {
      return
    }
    const file = files[0]
    const fileReader = new FileReader()
    fileReader.onload = function (e) {
      const dataUrl = e.srcElement.result
      templateInstance.avatarUrl.set(dataUrl)
    }
    fileReader.readAsDataURL(file)
  },
  'submit .edit-avatar-modal form' (e) {
    e.preventDefault()

    const templateInstance = Template.instance()

    Meteor.call('users.update', {
      avatar: templateInstance.avatarUrl.get()
    }, function () {
      Modal.hide(templateInstance)
    })
  }
})
