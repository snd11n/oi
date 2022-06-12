import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Blaze } from 'meteor/blaze';

import 'bootstrap/dist/css/bootstrap.min.css'

import './main.html';

// ------------------------------ Variables ------------------------------ //

// Template [timer]
var seconds = new ReactiveVar(10);

// Template [totalPoints]
var total = new ReactiveVar(0);

// Template [reinitialize]
var isDisabled = new ReactiveVar(true);

// ------------------------------ Templates ------------------------------ //

// Template [cible1]
Template.cible1.events({
    'click button'() {
        isDisabled.set(true);
        countdownTimer();
    }
});

// Template [timer]
Template.timer.helpers({
  seconds() { return seconds.get(); }
});

// Template [totalPoints]
Template.totalPoints.helpers({
    total() { return total.get(); }
});

// Template [reinitialize]
Template.reinitialize.helpers({
    isDisabled() { return isDisabled.get() }
});

Template.reinitialize.events({
  'click #reinitializeBtn'() {
      isDisabled.set(true);
      total.set(0);
      seconds.set(10);
  }
})

// ------------------------------ Functions ------------------------------ //

async function countdownTimer() {
    while (seconds.get() > 0) {
        seconds.set(seconds.get() - 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    isDisabled.set(false);
}