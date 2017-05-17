
Template.isAuthorized.helpers({
    isAuthorized: () =>
        Meteor.user()
        //&& Roles.userIsInRole(Meteor.userId(),['user'])
    ? true
    : false
})
