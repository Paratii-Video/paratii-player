/* eslint-env browser */

import { Template } from 'meteor/templating'
import { hideModal, EMAIL_REGEX } from '/imports/lib/utils.js'
import '/imports/api/users.js'
import './editProfileInfo.html'

Template.editProfileInfo.onCreated(function () {
  this.avatarUrl = new ReactiveVar('')
  this.newUsername = new ReactiveVar('')
  this.newEmail = new ReactiveVar('')
  this.errorMessage = new ReactiveVar('')
})

Template.editProfileInfo.helpers({
  currentEmail () {
    const user = Meteor.user()
    return (user && user.emails && user.emails[0] && user.emails[0].address) || ''
  },
  imageUrl () {
    return Template.instance().avatarUrl.get() || Meteor.user().profile.image || '/img/avatar_img.svg'
  },
  disabled () {
    return (
      (
        !Template.instance().avatarUrl.get() &&
        !Template.instance().newUsername.get().trim() &&
        !Template.instance().newEmail.get().trim()
      ) && 'disabled'
    ) || ''
  },
  errorMessage () {
    return Template.instance().errorMessage.get()
  }
})

Template.editProfileInfo.events({
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
  'keyup #new-email, change #new-email' (e) {
    Template.instance().newEmail.set(e.target.value)
  },
  'keyup #new-username, change #new-username' (e) {
    Template.instance().newUsername.set(e.target.value)
  },
  'submit #edit-profile-info-form' (e) {
    e.preventDefault()

    const templateInstance = Template.instance()

    const userUpdate = {}

    const email = templateInstance.newEmail.get().trim()

    if (templateInstance.avatarUrl.get()) {
      userUpdate.avatar = templateInstance.avatarUrl.get()
    }

    if (email) {
      if (!EMAIL_REGEX.test(email)) {
        $('#new-email').addClass('error')
        return
      }
      userUpdate.email = email
    }

    if (templateInstance.newUsername.get().trim()) {
      userUpdate.name = templateInstance.newUsername.get().trim()
    }

    Meteor.call('users.update', userUpdate, function (error) {
      if (error) {
        templateInstance.errorMessage.set(error.reason)
      } else {
        hideModal()
      }
    })
  }
})
