
Template.isAuthorized.helpers({
  isAuthorized: () =>
    !!Meteor.user()
})
