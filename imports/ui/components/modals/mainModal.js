import './mainModal.html'

Template.mainModal.onCreated(function () {
  // Set template
  Session.set('contentTemplate', this.data.contentTemplate)
  // Set options in a reactive var
  this.options = new ReactiveVar()
  this.options.set(this.data)
})

Template.mainModal.helpers({
  contentTemplate: () => Session.get('contentTemplate'),
  options: function () {
    return Template.instance().options.get()
  }
})
