import './modals.html'

Template.main_modal.onCreated(function () {
  this.modalState = new ReactiveDict()
  this.modalState.set('type', this.data.type)
})

Template.modal_earn_pti.onCreated(function () {
  this.stepState = new ReactiveDict()
  this.stepState.set('currentStep', 1)
})

Template.modal_earn_pti.helpers({
  currentStep () {
    return `step-${Template.instance().stepState.get('currentStep')}`
  }
})

Template.modal_earn_pti.events({
  'click button.prev' () {
    Template.instance().stepState.set('currentStep', Math.max(0, Template.instance().stepState.get('currentStep')) - 1)
  },
  'click button.next' () {
    Template.instance().stepState.set('currentStep', Math.min(3, Template.instance().stepState.get('currentStep')) + 1)
  }
})
